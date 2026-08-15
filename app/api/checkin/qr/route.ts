import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qr_payload, admin_wallet } = body;

    if (!admin_wallet) {
      return NextResponse.json(
        { error: 'Admin cüzdanı gerekli' },
        { status: 401 }
      );
    }

    // Verify admin
    const adminWallet = await prisma.wallet.findUnique({
      where: { address: admin_wallet },
      include: { user: true }
    });

    if (!adminWallet || adminWallet.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Sadece admin QR tarayabilir' },
        { status: 403 }
      );
    }

    // Parse QR payload (can be base64 encoded JSON or simple pipe-separated)
    let event_id: string;
    let user_id: string;
    let ticket_code: string;

    try {
      // Try to parse as base64 JSON first
      const decoded = JSON.parse(Buffer.from(qr_payload, 'base64url').toString('utf-8'));
      event_id = decoded.event_id;
      user_id = decoded.user_id;
      ticket_code = decoded.ticket;
    } catch {
      // Fallback to simple pipe-separated format: event_id|user_id|ticket_code
      const parts = qr_payload.split('|');
      if (parts.length < 3) {
        return NextResponse.json(
          { error: 'Geçersiz QR kod formatı' },
          { status: 400 }
        );
      }
      ticket_code = parts[0];
      event_id = parts[1];
      user_id = parts[2];
    }

    // Verify registration exists
    const registration = await prisma.registration.findFirst({
      where: {
        event_id,
        user_id,
        ticket_code,
        status: 'confirmed'
      },
      include: {
        user: true,
        event: true
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Kayıt bulunamadı veya onaylanmamış' },
        { status: 404 }
      );
    }

    // Check if already checked in
    const existingCheckin = await prisma.checkIn.findUnique({
      where: {
        user_id_event_id: {
          user_id,
          event_id
        }
      }
    });

    if (existingCheckin) {
      return NextResponse.json(
        { error: 'Bu kullanıcı zaten check-in yapmış', user: registration.user },
        { status: 409 }
      );
    }

    // Create check-in
    const checkin = await prisma.checkIn.create({
      data: {
        user_id,
        event_id,
        method: 'qr',
        device_hash: `admin_scanner_${Date.now()}`,
        verifier_id: adminWallet.user.id,
        checkin_at: new Date()
      },
      include: {
        user: true,
        event: true
      }
    });

    // Auto-issue certificate if event ended
    const eventEndTime = new Date(registration.event.end_at);
    const now = new Date();
    let certificate = null;

    if (now >= eventEndTime) {
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findUnique({
        where: {
          user_id_event_id: {
            user_id,
            event_id
          }
        }
      });

      if (!existingCert) {
        certificate = await prisma.certificate.create({
          data: {
            user_id,
            event_id,
            certificate_no: `CERT-${event_id.slice(-6)}-${user_id.slice(-6)}-${Date.now()}`,
            ipfs_cid: `Qm${Math.random().toString(36).substring(2, 15)}`,
            chain: 'Sui Testnet',
            contract_address: '0x' + '0'.repeat(40),
            token_id: `${Date.now()}`,
            tx_hash: '0x' + Math.random().toString(36).substring(2, 15),
            minted_at: new Date()
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in başarılı',
      checkin,
      user: registration.user,
      event: registration.event,
      certificate: certificate || null,
      certificate_issued: !!certificate,
      event_ended: now >= eventEndTime
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Check-in başarısız' },
      { status: 500 }
    );
  }
}
