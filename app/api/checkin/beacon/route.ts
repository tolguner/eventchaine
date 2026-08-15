import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/checkin/beacon - Check-in via Bluetooth beacon
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beacon_nonce, rssi, user_id, event_id } = body;

    // Validate input
    if (!beacon_nonce || !user_id || !event_id) {
      return NextResponse.json(
        { error: 'Missing required fields: beacon_nonce, user_id, event_id' },
        { status: 400 }
      );
    }

    // Validate RSSI (signal strength) - must be strong enough
    const minRSSI = -70; // Minimum signal strength for proximity
    if (rssi && rssi < minRSSI) {
      return NextResponse.json(
        { error: 'Signal too weak. Please move closer to the beacon.' },
        { status: 400 }
      );
    }

    // Find the event
    const event = db.events.find((e) => e.id === event_id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Find the user
    const user = db.users.find((u) => u.id === user_id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is registered for this event
    const registration = db.registrations.find(
      (r) => r.user_id === user_id && r.event_id === event_id
    );
    if (!registration) {
      return NextResponse.json(
        { error: 'User not registered for this event' },
        { status: 403 }
      );
    }

    // Check if already checked in
    const existingCheckin = db.checkins.find(
      (c) => c.user_id === user_id && c.event_id === event_id
    );
    if (existingCheckin) {
      return NextResponse.json(
        { error: 'Already checked in', checkin: existingCheckin },
        { status: 409 }
      );
    }

    // Verify beacon nonce (in production, this would validate against stored beacons)
    // Mock validation: just check if it's a valid format
    if (!/^BEACON-[A-Z0-9]{8}$/.test(beacon_nonce)) {
      return NextResponse.json(
        { error: 'Invalid beacon nonce format' },
        { status: 400 }
      );
    }

    // Create check-in record
    const checkin = {
      id: `c_${Date.now()}`,
      user_id,
      event_id,
      method: 'beacon' as const,
      device_hash: beacon_nonce, // Using beacon nonce as device identifier
      checkin_at: new Date().toISOString(),
      verifier_id: 'system', // Automatic beacon verification
    };

    db.checkins.push(checkin);

    return NextResponse.json({
      message: 'Check-in successful via beacon',
      checkin,
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
