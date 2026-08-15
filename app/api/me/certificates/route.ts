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

    const certificates = await prisma.certificate.findMany({
      where: { user_id: session.user_id },
      include: { event: true },
      orderBy: { minted_at: 'desc' },
    });
    
    // Format dates
    const formatted = certificates.map((cert: any) => ({
      ...cert,
      minted_at: cert.minted_at.toISOString(),
      revoked_at: cert.revoked_at?.toISOString() || null,
      event: {
        ...cert.event,
        tags: JSON.parse(cert.event.tags),
        start_at: cert.event.start_at.toISOString(),
        end_at: cert.event.end_at.toISOString(),
        created_at: cert.event.created_at.toISOString(),
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Certificates fetch error:', error);
    return NextResponse.json(
      { error: 'Sertifikalar yüklenemedi' },
      { status: 500 }
    );
  }
}
