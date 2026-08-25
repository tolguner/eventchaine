import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/checkin/beacon - BLE beacon ile check-in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beacon_nonce, rssi, user_id, event_id } = body;

    if (!beacon_nonce || !user_id || !event_id) {
      return NextResponse.json(
        { error: 'beacon_nonce, user_id ve event_id zorunludur' },
        { status: 400 }
      );
    }

    // Sinyal gücü kontrolü - yakınlık için yeterince güçlü olmalı
    const minRSSI = -70;
    if (rssi && rssi < minRSSI) {
      return NextResponse.json(
        { error: 'Sinyal çok zayıf. Beacon\'a daha yakın durun.' },
        { status: 400 }
      );
    }

    // Beacon nonce formatını doğrula
    if (!/^BEACON-[A-Z0-9]{8}$/.test(beacon_nonce)) {
      return NextResponse.json(
        { error: 'Geçersiz beacon nonce formatı' },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: event_id } });
    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const registration = await prisma.registration.findFirst({
      where: { user_id, event_id, status: 'confirmed' },
    });
    if (!registration) {
      return NextResponse.json(
        { error: 'Kullanıcı bu etkinliğe kayıtlı değil' },
        { status: 403 }
      );
    }

    const existingCheckin = await prisma.checkIn.findUnique({
      where: { user_id_event_id: { user_id, event_id } },
    });
    if (existingCheckin) {
      return NextResponse.json(
        { error: 'Zaten check-in yapılmış', checkin: existingCheckin },
        { status: 409 }
      );
    }

    const checkin = await prisma.checkIn.create({
      data: {
        user_id,
        event_id,
        method: 'beacon',
        device_hash: beacon_nonce,
        verifier_id: 'system', // otomatik beacon doğrulaması
      },
    });

    return NextResponse.json({
      message: 'Beacon ile check-in başarılı',
      checkin: {
        ...checkin,
        checkin_at: checkin.checkin_at.toISOString(),
      },
      event: {
        id: event.id,
        title: event.title,
      },
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Beacon check-in error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
