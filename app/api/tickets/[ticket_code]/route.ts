import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tickets/[ticket_code] - Bilet koduyla kayıt detayı
export async function GET(
  request: NextRequest,
  { params }: { params: { ticket_code: string } }
) {
  try {
    const { ticket_code } = params;

    const registration = await prisma.registration.findUnique({
      where: { ticket_code },
      include: { event: true, user: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Bilet bulunamadı' },
        { status: 404 }
      );
    }

    const checkin = await prisma.checkIn.findUnique({
      where: {
        user_id_event_id: {
          user_id: registration.user_id,
          event_id: registration.event_id,
        },
      },
    });

    const { event: _event, user: _user, ...ticket } = registration;

    return NextResponse.json({
      ticket: {
        ...ticket,
        created_at: registration.created_at.toISOString(),
      },
      event: {
        id: registration.event.id,
        title: registration.event.title,
        start_at: registration.event.start_at.toISOString(),
        end_at: registration.event.end_at.toISOString(),
        location: registration.event.location,
      },
      user: {
        id: registration.user.id,
        name: registration.user.name,
        email: registration.user.email,
      },
      checked_in: !!checkin,
      checkin_at: checkin?.checkin_at.toISOString() || null,
    });
  } catch (error) {
    console.error('Ticket lookup error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
