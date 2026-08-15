import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bu endpoint etkinlik bitiminde çağrılabilir veya cron job olarak çalıştırılabilir
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id } = body;

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

      // Yeni sertifika oluştur
      const certificate = await prisma.certificate.create({
        data: {
          user_id: checkin.user_id,
          event_id,
          certificate_no: `CERT-${event_id.slice(-6)}-${checkin.user_id.slice(-6)}-${Date.now()}`,
          ipfs_cid: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          chain: 'Sui Testnet',
          contract_address: '0x' + '0'.repeat(40),
          token_id: `${Date.now()}_${checkin.user_id.slice(-6)}`,
          tx_hash: '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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
