import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTicketCode, generateQRPayload } from '@/lib/crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'confirmed' },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }

    // Check wallet connection for paid events
    if (event.price > 0 && !session.user.walletAddress) {
      return NextResponse.json(
        { error: 'Ücretli etkinliklere katılmak için cüzdan bağlamalısınız' },
        { status: 400 }
      );
    }

    // Check existing registration
    const existingReg = await prisma.registration.findFirst({
      where: {
        user_id: session.user_id,
        event_id: event.id,
      },
    });

    if (existingReg) {
      return NextResponse.json(
        { error: 'Bu etkinliğe zaten kayıtlısınız' },
        { status: 400 }
      );
    }

    // Check capacity
    if (event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { error: 'Etkinlik kapasitesi dolu' },
        { status: 400 }
      );
    }

    // Get payment info from request body
    const body = await request.json();
    const { payment_tx_hash } = body;

    // Validate payment for paid events
    if (event.price > 0 && !payment_tx_hash) {
      return NextResponse.json(
        { error: 'Ödeme işlemi gerekli' },
        { status: 400 }
      );
    }

    const ticket_code = generateTicketCode();
    const qr_payload = generateQRPayload(ticket_code, event.id, session.user_id);

    const registration = await prisma.registration.create({
      data: {
        user_id: session.user_id,
        event_id: event.id,
        status: 'confirmed',
        ticket_code,
        qr_payload,
        payment_tx_hash: payment_tx_hash || null,
        payment_amount: event.price > 0 ? event.price : null,
        payment_currency: event.price > 0 ? event.currency : null,
      },
    });

    return NextResponse.json({
      ...registration,
      created_at: registration.created_at.toISOString(),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kayıt başarısız' },
      { status: 500 }
    );
  }
}
