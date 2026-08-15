import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tickets/[ticket_code] - Get ticket details by code
export async function GET(
  request: NextRequest,
  { params }: { params: { ticket_code: string } }
) {
  try {
    const { ticket_code } = params;

    // Find registration by ticket code
    const registration = db.registrations.find(
      (r) => r.ticket_code === ticket_code
    );

    if (!registration) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get event details
    const event = db.events.find((e) => e.id === registration.event_id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found for this ticket' },
        { status: 404 }
      );
    }

    // Get user details
    const user = db.users.find((u) => u.id === registration.user_id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found for this ticket' },
        { status: 404 }
      );
    }

    // Check if already checked in
    const checkin = db.checkins.find(
      (c) =>
        c.user_id === registration.user_id &&
        c.event_id === registration.event_id
    );

    return NextResponse.json({
      ticket: {
        ...registration,
        qr_payload: registration.qr_payload, // Include full QR payload
      },
      event: {
        id: event.id,
        title: event.title,
        start_at: event.start_at,
        end_at: event.end_at,
        location: event.location,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      checked_in: !!checkin,
      checkin_at: checkin?.checkin_at || null,
    });
  } catch (error) {
    console.error('Ticket lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
