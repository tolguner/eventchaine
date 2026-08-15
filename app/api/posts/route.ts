import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
