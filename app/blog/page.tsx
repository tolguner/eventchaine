'use client';

import { useEffect, useState } from 'react';
import BlogCard from '@/components/BlogCard';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <main className="flex-1 py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-container mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Blog
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Web3, Blockchain ve teknoloji hakkında yazılar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
  );
}
