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

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Fetch all registrations with user and event details
    const registrations = await prisma.registration.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            student_no: true,
            department: true,
            class_year: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            start_at: true,
            location: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Admin registrations fetch error:', error);
    return NextResponse.json(
      { error: 'Kayıtlar alınamadı' },
      { status: 500 }
    );
  }
}
