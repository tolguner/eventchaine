import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bu endpoint etkinlik bitiminde çağrılabilir veya cron job olarak çalıştırılabilir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      // Admin paneli gerçek bir mint yaptıysa sonucu buradan gönderir;
      // bu alanlar geldiğinde yalnızca ilgili kullanıcının sertifikası yazılır.
      user_id,
      nft_token_id,
      nft_tx_hash,
      metadata_url,
      blockchain,
    } = body;

    // Admin kontrolü
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece admin sertifika oluşturabilir' }, { status: 403 });
    }

    // Etkinliği bul
    const event = await prisma.event.findUnique({
      where: { id: event_id }
    });

    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // Check if event has ended
    const now = new Date();
    if (now < event.end_at) {
      return NextResponse.json({ 
        error: 'Etkinlik henüz bitmedi',
        event_end: event.end_at 
      }, { status: 400 });
    }

    // Tek kullanıcı + gerçek mint sonucu gönderildiyse onu kaydet
    if (user_id) {
      const certificate = await prisma.certificate.upsert({
        where: {
          user_id_event_id: { user_id, event_id }
        },
        update: {
          ipfs_cid: metadata_url || '',
          chain: blockchain || 'Sui Testnet',
          contract_address: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0',
          token_id: nft_token_id || '',
          tx_hash: nft_tx_hash || '',
        },
        create: {
          user_id,
          event_id,
          certificate_no: `CERT-${event_id.slice(-6)}-${user_id.slice(-6)}-${Date.now()}`,
          ipfs_cid: metadata_url || '',
          chain: blockchain || 'Sui Testnet',
          contract_address: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0',
          token_id: nft_token_id || '',
          tx_hash: nft_tx_hash || '',
          minted_at: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        event_title: event.title,
        certificates_created: 1,
        certificates_skipped: 0,
        certificate_no: certificate.certificate_no
      });
    }

    // Check-in yapmış kullanıcıları bul
    const checkins = await prisma.checkIn.findMany({
      where: { event_id },
      include: { user: true }
    });

    const createdCertificates = [];
    const skippedUsers = [];

    for (const checkin of checkins) {
      // Sertifika zaten var mı kontrol et
      const existingCert = await prisma.certificate.findUnique({
        where: {
          user_id_event_id: {
            user_id: checkin.user_id,
            event_id
          }
        }
      });

      if (existingCert) {
        skippedUsers.push({
          user: checkin.user.name,
          reason: 'Sertifika zaten mevcut'
        });
        continue;
      }

      // Yeni sertifika oluştur.
      // Zincir alanları boş bırakılır: gerçek bir mint yapılmadan sahte
      // tx_hash / token_id üretmiyoruz. Admin panelinden cüzdanla mint
      // edildiğinde bu kayıt gerçek değerlerle güncellenir.
      const certificate = await prisma.certificate.create({
        data: {
          user_id: checkin.user_id,
          event_id,
          certificate_no: `CERT-${event_id.slice(-6)}-${checkin.user_id.slice(-6)}-${Date.now()}`,
          ipfs_cid: '',
          chain: 'Sui Testnet',
          contract_address: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0',
          token_id: '',
          tx_hash: '',
          minted_at: new Date()
        },
        include: {
          user: true,
          event: true
        }
      });

      createdCertificates.push(certificate);
    }

    return NextResponse.json({
      success: true,
      event_title: event.title,
      total_checkins: checkins.length,
      certificates_created: createdCertificates.length,
      certificates_skipped: skippedUsers.length,
      created: createdCertificates.map(c => ({
        user: c.user.name,
        certificate_no: c.certificate_no
      })),
      skipped: skippedUsers
    });
  } catch (error) {
    console.error('Auto certificate error:', error);
    return NextResponse.json(
      { error: 'Sertifika oluşturma hatası' },
      { status: 500 }
    );
  }
}

// GET endpoint - Biten etkinlikleri listele ve sertifika durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Sadece admin erişebilir' }, { status: 403 });
    }

    const now = new Date();
    
    // Biten etkinlikleri bul
    const endedEvents = await prisma.event.findMany({
      where: {
        end_at: {
          lt: now
        }
      },
      include: {
        checkIns: true,
        certificates: true
      },
      orderBy: {
        end_at: 'desc'
      },
      take: 50
    });

    const eventStatus = endedEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      ended_at: event.end_at,
      total_checkins: event.checkIns.length,
      certificates_issued: event.certificates.length,
      pending_certificates: event.checkIns.length - event.certificates.length,
      needs_certificates: event.checkIns.length > event.certificates.length
    }));

    return NextResponse.json({
      total_ended_events: endedEvents.length,
      events: eventStatus,
      events_needing_certificates: eventStatus.filter((e: any) => e.needs_certificates)
    });
  } catch (error) {
    console.error('Event status error:', error);
    return NextResponse.json(
      { error: 'Veri alınamadı' },
      { status: 500 }
    );
  }
}
