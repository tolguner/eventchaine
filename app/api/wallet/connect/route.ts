import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('Auth header token:', token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Lütfen giriş yapın' },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    console.log('Session found:', !!session);

    if (!session || new Date() > session.expires_at) {
      return NextResponse.json(
        { error: 'Oturum süresi dolmuş' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Cüzdan adresi gerekli' },
        { status: 400 }
      );
    }

    // SUI adresleri 0x + 64 hex karakterdir (EVM'in 40 karakteri değil)
    if (!/^0x[0-9a-fA-F]{64}$/.test(wallet_address)) {
      return NextResponse.json(
        { error: 'Geçersiz SUI cüzdan adresi formatı' },
        { status: 400 }
      );
    }

    // Check if wallet already connected to another user
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress: wallet_address,
        NOT: { id: session.user_id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu cüzdan başka bir hesaba bağlı' },
        { status: 400 }
      );
    }

    // Update user wallet
    const updatedUser = await prisma.user.update({
      where: { id: session.user_id },
      data: {
        walletAddress: wallet_address,
        wallet_connected_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      wallet_address: updatedUser.walletAddress,
      connected_at: updatedUser.wallet_connected_at?.toISOString(),
    });
  } catch (error) {
    console.error('Wallet connect error:', error);
    return NextResponse.json(
      { error: 'Cüzdan bağlantısı başarısız' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Lütfen giriş yapın' },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || new Date() > session.expires_at) {
      return NextResponse.json(
        { error: 'Oturum süresi dolmuş' },
        { status: 401 }
      );
    }

    // Remove wallet from user
    await prisma.user.update({
      where: { id: session.user_id },
      data: {
        walletAddress: null,
        wallet_connected_at: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cüzdan bağlantısı kaldırıldı',
    });
  } catch (error) {
    console.error('Wallet disconnect error:', error);
    return NextResponse.json(
      { error: 'İşlem başarısız' },
      { status: 500 }
    );
  }
}
