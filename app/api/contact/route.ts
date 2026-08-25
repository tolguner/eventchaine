import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateContactForm } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateContactForm(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await prisma.contactMessage.create({
      data: validation.data,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilemedi' },
      { status: 500 }
    );
  }
}

// Admin: gelen mesajları listele
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

    if (!session || new Date() > session.expires_at || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz işlem' },
        { status: 403 }
      );
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(
      messages.map((m) => ({ ...m, created_at: m.created_at.toISOString() }))
    );
  } catch (error) {
    console.error('Contact messages fetch error:', error);
    return NextResponse.json(
      { error: 'Mesajlar yüklenemedi' },
      { status: 500 }
    );
  }
}
