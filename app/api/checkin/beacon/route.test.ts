import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

const EVENT_ID = 'e_beacon_test';
const USER_ID = 'u_beacon_test';

function beaconRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/checkin/beacon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    beacon_nonce: 'BEACON-AB12CD34',
    rssi: -45,
    user_id: USER_ID,
    event_id: EVENT_ID,
    ...overrides,
  };
}

async function clearAll() {
  await prisma.checkIn.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await clearAll();

  await prisma.user.create({
    data: { id: USER_ID, name: 'Katılımcı', email: 'beacon@test.local', role: 'user' },
  });
  await prisma.user.create({
    data: { id: 'u_beacon_owner', name: 'Admin', email: 'beacon-admin@test.local', role: 'admin' },
  });
  await prisma.event.create({
    data: {
      id: EVENT_ID,
      title: 'Beacon Test Etkinliği',
      slug: 'beacon-test-etkinligi',
      description: 'test',
      start_at: new Date('2026-01-01T10:00:00Z'),
      end_at: new Date('2026-01-01T12:00:00Z'),
      location: 'Test',
      capacity: 10,
      created_by: 'u_beacon_owner',
    },
  });
});

afterAll(clearAll);

async function registerUser() {
  await prisma.registration.create({
    data: {
      user_id: USER_ID,
      event_id: EVENT_ID,
      status: 'confirmed',
      ticket_code: 'TCKT-BEAC-0001',
      qr_payload: 'payload',
    },
  });
}

describe('POST /api/checkin/beacon', () => {
  it('kayıtlı katılımcı için check-in oluşturur', async () => {
    await registerUser();

    const res = await POST(beaconRequest(validBody()));
    expect(res.status).toBe(200);

    const checkin = await prisma.checkIn.findUnique({
      where: { user_id_event_id: { user_id: USER_ID, event_id: EVENT_ID } },
    });
    expect(checkin).not.toBeNull();
    expect(checkin?.method).toBe('beacon');
    expect(checkin?.device_hash).toBe('BEACON-AB12CD34');
    expect(checkin?.verifier_id).toBe('system');
  });

  it('etkinliğe kayıtlı olmayan kullanıcıyı 403 ile reddeder', async () => {
    const res = await POST(beaconRequest(validBody()));

    expect(res.status).toBe(403);
    expect(await prisma.checkIn.count()).toBe(0);
  });

  it('mükerrer check-in\'i 409 ile reddeder', async () => {
    await registerUser();
    await POST(beaconRequest(validBody()));

    const res = await POST(beaconRequest(validBody()));
    expect(res.status).toBe(409);
    expect(await prisma.checkIn.count()).toBe(1);
  });

  it('geçersiz nonce formatını reddeder', async () => {
    await registerUser();

    const res = await POST(beaconRequest(validBody({ beacon_nonce: 'kotu-format' })));
    expect(res.status).toBe(400);
    expect(await prisma.checkIn.count()).toBe(0);
  });

  it('zayıf sinyali (rssi < -70) reddeder', async () => {
    await registerUser();

    const res = await POST(beaconRequest(validBody({ rssi: -90 })));
    expect(res.status).toBe(400);
    expect(await prisma.checkIn.count()).toBe(0);
  });

  it('zorunlu alanlar eksikse 400 döner', async () => {
    const res = await POST(beaconRequest({ beacon_nonce: 'BEACON-AB12CD34' }));
    expect(res.status).toBe(400);
  });

  it('olmayan etkinlik için 404 döner', async () => {
    const res = await POST(beaconRequest(validBody({ event_id: 'yok-boyle' })));
    expect(res.status).toBe(404);
  });
});
