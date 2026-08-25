import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCertificateNo } from '@/lib/crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Lütfen giriş yapın' },
        { status: 401 }
      );
    }

    // Verify admin session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || new Date() > session.expires_at || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz işlem' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { batch = false, user_ids = [], nft_data = null } = body;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }

    const certificates: any[] = [];

    // Get users who checked in
    let targetUserIds: string[] = [];
    if (batch) {
      const checkins = await prisma.checkIn.findMany({
        where: { event_id: params.id },
        select: { user_id: true },
      });
      targetUserIds = Array.from(new Set(checkins.map(c => c.user_id)));
    } else {
      targetUserIds = user_ids;
    }

    for (const userId of targetUserIds) {
      // Check if already has certificate
      const existing = await prisma.certificate.findFirst({
        where: {
          user_id: userId,
          event_id: params.id,
        },
      });
      
      if (existing) continue;

      // Get user wallet address
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallets: {
            where: { is_primary: true },
            take: 1,
          },
        },
      });

      if (!user || !user.wallets || user.wallets.length === 0) {
        console.log(`User ${userId} has no wallet, skipping certificate`);
        continue;
      }

      const walletAddress = user.wallets[0].address;

      // Sertifika kaydını oluştur. nft_data yalnızca admin panelinden
      // cüzdanla gerçek mint yapıldığında dolu gelir; gelmediğinde zincir
      // alanları boş bırakılır (sahte tx_hash / token_id üretilmez).
      const certificate = await prisma.certificate.create({
        data: {
          user_id: userId,
          event_id: params.id,
          certificate_no: generateCertificateNo(new Date().toISOString()),
          ipfs_cid: nft_data?.ipfs_cid || '',
          chain: 'Sui Testnet',
          contract_address: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0',
          token_id: nft_data?.objectId || '',
          tx_hash: nft_data?.txHash || '',
          minted_at: new Date(),
          revoked_at: null,
        },
      });

      certificates.push({
        ...certificate,
        user_name: user.name,
        user_email: user.email,
        wallet_address: walletAddress,
      });
    }

    return NextResponse.json({
      success: true,
      count: certificates.length,
      certificates: certificates,
      message: `${certificates.length} adet NFT sertifikası başarıyla oluşturuldu`,
    });
  } catch (error) {
    console.error('Certificate issue error:', error);
    return NextResponse.json(
      { error: 'Sertifika dağıtımı başarısız' },
      { status: 500 }
    );
  }
}
