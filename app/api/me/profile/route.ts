import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('Profile Update - Token:', token);
    
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
    
    console.log('Profile Update - Session found:', !!session);

    if (!session || new Date() > session.expires_at) {
      return NextResponse.json(
        { error: 'Oturum süresi dolmuş' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, student_no, department, class_year } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Ad ve e-posta zorunludur' },
        { status: 400 }
      );
    }

    // Check if email already exists (for different user)
    if (email && email.trim() !== '' && !email.includes('@temp.com')) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== session.user_id) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: session.user_id },
      data: {
        name,
        email,
        student_no,
        department,
        class_year,
      },
    });

    return NextResponse.json({
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenemedi' },
      { status: 500 }
    );
  }
}

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
      include: { 
        user: {
          include: {
            wallets: {
              orderBy: { is_primary: 'desc' }
            }
          }
        } 
      },
    });

    if (!session || new Date() > session.expires_at) {
      return NextResponse.json(
        { error: 'Oturum süresi dolmuş' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Profil bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
