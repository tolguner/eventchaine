import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Görüntülenme sayısını 1 artır
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      ...post,
      views: (post.views || 0) + 1, // Güncellenmiş görüntülenme sayısını döndür
      created_at: post.created_at.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Blog yazısı yüklenemedi' },
      { status: 500 }
    );
  }
}
