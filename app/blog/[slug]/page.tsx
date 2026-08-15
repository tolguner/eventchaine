'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Badge from '@/components/Badge';

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/posts/${params.slug}`)
      .then(res => res.json())
      .then(data => setPost(data));
  }, [params.slug]);

  if (!post) return null;

  const date = new Date(post.created_at);

  return (
    <main className="flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="relative bg-gradient-to-br from-secondary to-primary h-80 overflow-hidden">
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover opacity-90"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div className="max-w-container mx-auto px-6 -mt-32 pb-16 relative z-10">
          <article className="rounded-2xl shadow-lg p-8 mb-8 relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Badge variant="primary" className="mb-4">{post.category}</Badge>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{post.title}</h1>
            
            <div className="flex items-center gap-4 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              <span>{post.author}</span>
              <span>•</span>
              <span>{date.toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              {post.views !== undefined && (
                <>
                  <span>•</span>
                  <span>👁️ {post.views} görüntülenme</span>
                </>
              )}
            </div>

            <div className="max-w-none">
              <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.excerpt}</p>
              <div className="whitespace-pre-line leading-relaxed text-base" style={{ color: 'var(--text-primary)' }}>{post.content}</div>
            </div>
          </article>
        </div>
      </main>
  );
}
