import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createPost } from './route';
import { GET as getPost, PUT as updatePost, DELETE as deletePost } from './[slug]/route';
import { prisma } from '@/lib/prisma';

const ADMIN_TOKEN = 'posts-admin-token';
const USER_TOKEN = 'posts-user-token';

function jsonRequest(url: string, method: string, body?: unknown, token?: string) {
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function seedUsers() {
  await prisma.user.create({
    data: { id: 'u_posts_admin', name: 'Admin', email: 'posts-admin@test.local', role: 'admin' },
  });
  await prisma.user.create({
    data: { id: 'u_posts_user', name: 'User', email: 'posts-user@test.local', role: 'user' },
  });
  const expires_at = new Date(Date.now() + 60_000);
  await prisma.session.create({
    data: { token: ADMIN_TOKEN, user_id: 'u_posts_admin', expires_at },
  });
  await prisma.session.create({
    data: { token: USER_TOKEN, user_id: 'u_posts_user', expires_at },
  });
}

async function clearAll() {
  await prisma.blogPost.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await clearAll();
  await seedUsers();
});

afterAll(clearAll);

describe('POST /api/posts', () => {
  it('admin yazı oluşturur ve Türkçe başlıktan doğru slug üretir', async () => {
    const res = await createPost(
      jsonRequest(
        'http://localhost:3000/api/posts',
        'POST',
        { title: 'Gerçek Tarayıcı Testi Yazısı', content: 'içerik', excerpt: 'özet' },
        ADMIN_TOKEN
      )
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    // Regresyon: Türkçe karakterler tire yapılmadan siliniyordu (bkz. f2c11ce)
    expect(body.slug).toBe('gercek-tarayici-testi-yazisi');

    const saved = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
    expect(saved).not.toBeNull();
  });

  it('yetkisiz kullanıcı yazı oluşturamaz', async () => {
    const res = await createPost(
      jsonRequest(
        'http://localhost:3000/api/posts',
        'POST',
        { title: 'İzinsiz', content: 'içerik' },
        USER_TOKEN
      )
    );

    expect(res.status).toBe(403);
    expect(await prisma.blogPost.count()).toBe(0);
  });

  it('başlık veya içerik eksikse 400 döner', async () => {
    const res = await createPost(
      jsonRequest('http://localhost:3000/api/posts', 'POST', { title: 'Sadece başlık' }, ADMIN_TOKEN)
    );

    expect(res.status).toBe(400);
    expect(await prisma.blogPost.count()).toBe(0);
  });

  it('aynı slug\'a düşen ikinci yazıyı 409 ile reddeder', async () => {
    const payload = { title: 'Aynı Başlık', content: 'içerik' };
    await createPost(jsonRequest('http://localhost:3000/api/posts', 'POST', payload, ADMIN_TOKEN));
    const res = await createPost(
      jsonRequest('http://localhost:3000/api/posts', 'POST', payload, ADMIN_TOKEN)
    );

    expect(res.status).toBe(409);
    expect(await prisma.blogPost.count()).toBe(1);
  });
});

describe('GET /api/posts/[slug] görüntülenme sayacı', () => {
  beforeEach(async () => {
    await prisma.blogPost.create({
      data: {
        id: 'b_test',
        title: 'Sayaç Testi',
        slug: 'sayac-testi',
        excerpt: 'özet',
        content: 'içerik',
      },
    });
  });

  it('çerezi olmayan ziyaretçide sayacı artırır ve çerez bırakır', async () => {
    const res = await getPost(
      new NextRequest('http://localhost:3000/api/posts/sayac-testi'),
      { params: { slug: 'sayac-testi' } }
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ views: 1 });

    const post = await prisma.blogPost.findUnique({ where: { slug: 'sayac-testi' } });
    expect(post?.views).toBe(1);
    expect(res.cookies.get('viewed_posts')?.value).toContain('sayac-testi');
  });

  it('aynı yazıyı daha önce okumuş ziyaretçide sayacı artırmaz', async () => {
    const request = new NextRequest('http://localhost:3000/api/posts/sayac-testi');
    request.cookies.set('viewed_posts', 'sayac-testi');

    const res = await getPost(request, { params: { slug: 'sayac-testi' } });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ views: 0 });

    const post = await prisma.blogPost.findUnique({ where: { slug: 'sayac-testi' } });
    expect(post?.views).toBe(0);
  });

  it('olmayan yazı için 404 döner', async () => {
    const res = await getPost(
      new NextRequest('http://localhost:3000/api/posts/yok-boyle'),
      { params: { slug: 'yok-boyle' } }
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT ve DELETE /api/posts/[slug]', () => {
  beforeEach(async () => {
    await prisma.blogPost.create({
      data: {
        id: 'b_duzenle',
        title: 'Eski Başlık',
        slug: 'eski-baslik',
        excerpt: 'özet',
        content: 'içerik',
        views: 42,
      },
    });
  });

  it('admin güncellerken slug\'ı yeniler ama görüntülenme sayısına dokunmaz', async () => {
    const res = await updatePost(
      jsonRequest(
        'http://localhost:3000/api/posts/eski-baslik',
        'PUT',
        { title: 'Yeni Şahane Başlık' },
        ADMIN_TOKEN
      ),
      { params: { slug: 'eski-baslik' } }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe('yeni-sahane-baslik');
    // views admin tarafından değiştirilememeli
    expect(body.views).toBe(42);
  });

  it('yetkisiz kullanıcı güncelleyemez', async () => {
    const res = await updatePost(
      jsonRequest(
        'http://localhost:3000/api/posts/eski-baslik',
        'PUT',
        { title: 'İzinsiz Değişiklik' },
        USER_TOKEN
      ),
      { params: { slug: 'eski-baslik' } }
    );

    expect(res.status).toBe(403);
    const post = await prisma.blogPost.findUnique({ where: { id: 'b_duzenle' } });
    expect(post?.title).toBe('Eski Başlık');
  });

  it('admin yazıyı siler', async () => {
    const res = await deletePost(
      jsonRequest('http://localhost:3000/api/posts/eski-baslik', 'DELETE', undefined, ADMIN_TOKEN),
      { params: { slug: 'eski-baslik' } }
    );

    expect(res.status).toBe(200);
    expect(await prisma.blogPost.count()).toBe(0);
  });

  it('yetkisiz kullanıcı silemez', async () => {
    const res = await deletePost(
      jsonRequest('http://localhost:3000/api/posts/eski-baslik', 'DELETE', undefined, USER_TOKEN),
      { params: { slug: 'eski-baslik' } }
    );

    expect(res.status).toBe(403);
    expect(await prisma.blogPost.count()).toBe(1);
  });
});
