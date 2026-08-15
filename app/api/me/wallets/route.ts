import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Kullanıcının tüm cüzdanlarını listele
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
    });

    if (!session || new Date() > session.expires_at) {
      return NextResponse.json(
        { error: 'Oturum süresi dolmuş' },
        { status: 401 }
      );
    }

    const wallets = await prisma.wallet.findMany({
      where: { user_id: session.user_id },
      orderBy: { is_primary: 'desc' },
    });

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('Get wallets error:', error);
    return NextResponse.json(
      { error: 'Cüzdanlar listelenemedi' },
      { status: 500 }
    );
  }
}

// POST - Devre dışı (Her kullanıcının sadece bir cüzdanı olabilir)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Her kullanıcının sadece bir cüzdanı olabilir. Cüzdan eklenemez.' },
    { status: 403 }
  );
}

// PATCH - Devre dışı (Her kullanıcının sadece bir cüzdanı olabilir)
export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: 'Her kullanıcının sadece bir cüzdanı olabilir. Cüzdan değiştirilemez.' },
    { status: 403 }
  );
}

// DELETE - Devre dışı (Her kullanıcının sadece bir cüzdanı olabilir)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Hesabınıza bağlı olan cüzdan silinemez. Hesabınızı silmek isterseniz iletişime geçin.' },
    { status: 403 }
  );
}
