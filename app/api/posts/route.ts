import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { created_at: 'desc' },
    });

    const formatted = posts.map(post => ({
      ...post,
      created_at: post.created_at.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json(
      { error: 'Blog yazıları yüklenemedi' },
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

    if (!session || new Date() > session.expires_at || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz işlem' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Başlık ve içerik zorunludur' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: slugify(body.title),
        excerpt: body.excerpt || '',
        content: body.content,
        cover_url: body.cover_url || '',
        category: body.category || 'Genel',
        author: body.author || session.user.name,
      },
    });

    return NextResponse.json({
      ...post,
      created_at: post.created_at.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu başlıkla başka bir yazı zaten var' },
        { status: 409 }
      );
    }
    console.error('Blog post create error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı oluşturulamadı' },
      { status: 500 }
    );
  }
}
