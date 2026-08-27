import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { prisma } from '@/lib/prisma';

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getRequest(token?: string) {
  return new NextRequest('http://localhost:3000/api/contact', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

async function createUser(id: string, role: 'admin' | 'user') {
  return prisma.user.create({
    data: { id, name: `Test ${role}`, email: `${id}@test.local`, role },
  });
}

async function createSession(token: string, user_id: string, expiresInMs = 60_000) {
  return prisma.session.create({
    data: { token, user_id, expires_at: new Date(Date.now() + expiresInMs) },
  });
}

describe('POST /api/contact', () => {
  beforeEach(async () => {
    await prisma.contactMessage.deleteMany();
  });

  it('geçerli mesajı veritabanına kaydeder', async () => {
    const res = await POST(
      postRequest({ name: 'Test Kullanıcı', email: 'test@example.com', message: 'Merhaba' })
    );

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ success: true });

    const saved = await prisma.contactMessage.findMany();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      name: 'Test Kullanıcı',
      email: 'test@example.com',
      message: 'Merhaba',
    });
  });

  it('geçersiz e-postayı reddeder ve hiçbir şey kaydetmez', async () => {
    const res = await POST(
      postRequest({ name: 'X', email: 'gecersiz-eposta', message: 'msg' })
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Geçersiz e-posta adresi' });
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it('boş alanları reddeder', async () => {
    const res = await POST(postRequest({ name: '', email: 'a@b.com', message: '' }));

    expect(res.status).toBe(400);
    expect(await prisma.contactMessage.count()).toBe(0);
  });
});

describe('GET /api/contact (admin)', () => {
  beforeEach(async () => {
    await prisma.contactMessage.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.contactMessage.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('token olmadan 401 döner', async () => {
    const res = await GET(getRequest());
    expect(res.status).toBe(401);
  });

  it('normal kullanıcı token\'ıyla 403 döner', async () => {
    await createUser('u_normal', 'user');
    await createSession('normal-token', 'u_normal');

    const res = await GET(getRequest('normal-token'));
    expect(res.status).toBe(403);
  });

  it('süresi dolmuş admin oturumuyla 403 döner', async () => {
    await createUser('u_admin_exp', 'admin');
    await createSession('expired-token', 'u_admin_exp', -1000);

    const res = await GET(getRequest('expired-token'));
    expect(res.status).toBe(403);
  });

  it('admin token\'ıyla mesajları en yeniden eskiye döner', async () => {
    await createUser('u_admin_ok', 'admin');
    await createSession('admin-token', 'u_admin_ok');

    await prisma.contactMessage.create({
      data: {
        name: 'Eski',
        email: 'eski@test.local',
        message: 'eski mesaj',
        created_at: new Date('2026-01-01'),
      },
    });
    await prisma.contactMessage.create({
      data: {
        name: 'Yeni',
        email: 'yeni@test.local',
        message: 'yeni mesaj',
        created_at: new Date('2026-06-01'),
      },
    });

    const res = await GET(getRequest('admin-token'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe('Yeni');
    expect(body[1].name).toBe('Eski');
  });
});
