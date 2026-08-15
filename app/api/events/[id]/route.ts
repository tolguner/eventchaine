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
