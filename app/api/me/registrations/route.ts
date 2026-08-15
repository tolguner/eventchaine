import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const registrations = await prisma.registration.findMany({
      where: { user_id: session.user_id },
      include: { event: true },
      orderBy: { created_at: 'desc' },
    });
    
    // Format dates
    const formatted = registrations.map(reg => ({
      ...reg,
      created_at: reg.created_at.toISOString(),
      event: {
        ...reg.event,
        tags: JSON.parse(reg.event.tags),
        start_at: reg.event.start_at.toISOString(),
        end_at: reg.event.end_at.toISOString(),
        created_at: reg.event.created_at.toISOString(),
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    return NextResponse.json(
      { error: 'Kayıtlar yüklenemedi' },
      { status: 500 }
    );
  }
}
