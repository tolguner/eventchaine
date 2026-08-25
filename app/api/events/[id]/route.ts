import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
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

    return NextResponse.json({
      ...event,
      tags: JSON.parse(event.tags),
      start_at: event.start_at.toISOString(),
      end_at: event.end_at.toISOString(),
      created_at: event.created_at.toISOString(),
      current_registrations: event._count.registrations,
      is_full: event._count.registrations >= event.capacity,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Etkinlik yüklenemedi' },
      { status: 500 }
    );
  }
}

// Admin oturumunu doğrular; yetkisizse doğrudan hata yanıtı döner
async function requireAdmin(request: NextRequest) {
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

  if (!session || new Date() > session.expires_at || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Yetkisiz işlem' },
      { status: 403 }
    );
  }

  return session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const title = body.title ?? event.title;

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description ?? event.description,
        start_at: body.start_at ? new Date(body.start_at) : event.start_at,
        end_at: body.end_at ? new Date(body.end_at) : event.end_at,
        location: body.location ?? event.location,
        capacity: body.capacity ?? event.capacity,
        price: body.price ?? event.price,
        currency: body.currency ?? event.currency,
        tags: body.tags ? JSON.stringify(body.tags) : event.tags,
        cover_url: body.cover_url ?? event.cover_url,
        is_published: body.is_published ?? event.is_published,
      },
    });

    return NextResponse.json({
      ...updated,
      tags: JSON.parse(updated.tags),
      start_at: updated.start_at.toISOString(),
      end_at: updated.end_at.toISOString(),
      created_at: updated.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu başlıkla başka bir etkinlik zaten var' },
        { status: 409 }
      );
    }
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: 'Etkinlik güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }

    // Kayıt, check-in ve sertifikalar şemadaki cascade ile birlikte silinir
    await prisma.event.delete({ where: { id: event.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: 'Etkinlik silinemedi' },
      { status: 500 }
    );
  }
}
