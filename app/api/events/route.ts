import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const date = searchParams.get('date');
    const q = searchParams.get('q');

    const events = await prisma.event.findMany({
      where: {
        is_published: true,
        ...(tag && { tags: { contains: tag } }),
        ...(date && { start_at: { gte: new Date(date) } }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }),
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
      orderBy: { start_at: 'asc' },
    });

    // Parse tags from JSON string and add registration counts
    const eventsWithParsedTags = events.map((event: any) => ({
      ...event,
      tags: JSON.parse(event.tags),
      start_at: event.start_at.toISOString(),
      end_at: event.end_at.toISOString(),
      created_at: event.created_at.toISOString(),
      current_registrations: event._count.registrations,
      is_full: event._count.registrations >= event.capacity,
      remaining_seats: event.capacity - event._count.registrations,
    }));

    return NextResponse.json(eventsWithParsedTags);
  } catch (error) {
    return NextResponse.json(
      { error: 'Etkinlikler yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz işlem' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        start_at: new Date(body.start_at),
        end_at: new Date(body.end_at),
        location: body.location,
        capacity: body.capacity,
        price: body.price,
        currency: body.currency || 'FREE',
        tags: JSON.stringify(body.tags || []),
        cover_url: body.cover_url,
        created_by: session.user_id,
        is_published: true,
      },
    });

    return NextResponse.json({
      ...newEvent,
      tags: JSON.parse(newEvent.tags),
      start_at: newEvent.start_at.toISOString(),
      end_at: newEvent.end_at.toISOString(),
      created_at: newEvent.created_at.toISOString(),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Etkinlik oluşturulamadı' },
      { status: 500 }
    );
  }
}
