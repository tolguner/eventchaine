import Link from 'next/link';
import Image from 'next/image';
import Badge from './Badge';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_url: string;
    category: string;
    created_at: string;
    author: string;
    views?: number;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.created_at);

  return (
    <Link href={`/blog/${post.slug}`}>
      <div 
        className="rounded-2xl hover:shadow-lg transition-all overflow-hidden h-full group"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border-primary)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0346b9, #fa9e0f)' }}>
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            unoptimized
          />
        </div>
        
        <div className="p-6">
          <Badge variant="secondary">{post.category}</Badge>

          <h3 
            className="font-semibold text-xl mt-3 mb-2 line-clamp-2 group-hover:opacity-80 transition"
            style={{ color: 'var(--text-primary)' }}
          >
            {post.title}
          </h3>

          <p 
            className="text-sm mb-4 line-clamp-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            {post.excerpt}
          </p>

          <div 
            className="flex items-center justify-between text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <span>{post.author}</span>
            <span>{date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          
          {post.views !== undefined && post.views > 0 && (
            <div className="mt-3 pt-3 flex items-center gap-1 text-xs" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-tertiary)' }}>
              <span>👁️</span>
              <span>{post.views} görüntülenme</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
