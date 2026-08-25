import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VIEW_COOKIE = 'viewed_posts';

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

// id veya slug ile blog yazısını bulur
function findPost(idOrSlug: string) {
  return prisma.blogPost.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }

    // Görüntülenme sayacı: aynı ziyaretçi için günde bir kez artar.
    // Okunan yazıların slug'ları bir çerezde tutulur.
    const viewed = (request.cookies.get(VIEW_COOKIE)?.value || '')
      .split(',')
      .filter(Boolean);
    const alreadyViewed = viewed.includes(post.slug);

    if (!alreadyViewed) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      });
    }

    const response = NextResponse.json({
      ...post,
      views: alreadyViewed ? post.views : post.views + 1,
      created_at: post.created_at.toISOString(),
    });

    if (!alreadyViewed) {
      response.cookies.set(VIEW_COOKIE, [...viewed, post.slug].join(','), {
        maxAge: 60 * 60 * 24, // 1 gün
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Blog yazısı yüklenemedi' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const post = await findPost(params.slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const title = body.title ?? post.title;

    // views alanı bilinçli olarak güncellenmiyor; admin müdahale edemez
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: body.excerpt ?? post.excerpt,
        content: body.content ?? post.content,
        cover_url: body.cover_url ?? post.cover_url,
        category: body.category ?? post.category,
        author: body.author ?? post.author,
      },
    });

    return NextResponse.json({
      ...updated,
      created_at: updated.created_at.toISOString(),
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu başlıkla başka bir yazı zaten var' },
        { status: 409 }
      );
    }
    console.error('Blog post update error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı güncellenemedi' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const post = await findPost(params.slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({ where: { id: post.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog post delete error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı silinemedi' },
      { status: 500 }
    );
  }
}
