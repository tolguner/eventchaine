import Link from 'next/link';
import Image from 'next/image';
import Badge from './Badge';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    start_at: string;
    location: string;
    capacity: number;
    price: number;
    currency: string;
    tags: string[];
    cover_url: string;
    current_registrations?: number;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const date = new Date(event.start_at);
  const isFull = (event.current_registrations || 0) >= event.capacity;

  return (
    <Link href={`/events/${event.slug}`}>
      <div 
        className="rounded-2xl hover:shadow-lg transition-all overflow-hidden h-full group"
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '2px solid var(--border-primary)'
        }}
      >
        <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(250,158,15,0.1), rgba(3,70,185,0.1))' }}>
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {event.tags.map(tag => (
              <Badge key={tag} variant="primary">{tag}</Badge>
            ))}
          </div>

          <h3 
            className="font-bold text-xl mb-2 line-clamp-2 transition-colors group-hover:opacity-80"
            style={{ color: 'var(--text-primary)' }}
          >
            {event.title}
          </h3>

          <p 
            className="text-sm mb-4 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {event.description}
          </p>

          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={isFull ? 'text-red-500 font-medium' : ''}>
                {event.current_registrations || 0} / {event.capacity} {isFull && '(Dolu)'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="flex items-center justify-between">
              {event.price > 0 ? (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-bold text-primary">{event.price} {event.currency}</span>
                </div>
              ) : (
                <span className="text-primary font-bold">Ücretsiz</span>
              )}
              <Badge variant={event.price > 0 ? 'warning' : 'success'}>
                {event.price > 0 ? 'Ücretli' : 'Açık'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
