'use client';

import { useEffect, useState } from 'react';
import EventCard from '@/components/EventCard';
import Badge from '@/components/Badge';

type FilterType = {
  pricing?: string;
  tag?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setAllEvents(data);
        setEvents(data);
      });
  }, []);

  useEffect(() => {
    let filtered = [...allEvents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query)
      );
    }

    // Pricing filter
    if (filters.pricing === 'free') {
      filtered = filtered.filter(e => e.price === 0 || e.currency === 'FREE');
    } else if (filters.pricing === 'paid') {
      filtered = filtered.filter(e => e.price > 0 && e.currency !== 'FREE');
    }

    // Tag filter
    // API tags alanını dizi olarak döndürüyor; eski kayıtlar için JSON
    // string ihtimalini de karşıla.
    if (filters.tag) {
      filtered = filtered.filter(e => {
        const tags = Array.isArray(e.tags)
          ? e.tags
          : (() => {
              try {
                return JSON.parse(e.tags || '[]');
              } catch {
                return [];
              }
            })();
        return tags.includes(filters.tag);
      });
    }

    setEvents(filtered);
  }, [filters, allEvents, searchQuery]);

  const updateFilter = (key: keyof FilterType, value: string | undefined) => {
    setFilters(prev => {
      if (value === undefined) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <main className="flex-1 py-12 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-container mx-auto">
          <h1 className="font-heading font-bold text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Etkinlikler
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Yakın ve geçmiş etkinliklere göz atın
          </p>

          {/* Search and Filter Toggle */}
          <div className="mb-6 flex gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Etkinlik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl transition"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-secondary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl transition hover:opacity-80 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filtreler {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filter Section (Collapsible) */}
          {showFilters && (
            <div className="mb-8 p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>
                  Filtreleme Seçenekleri
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm px-4 py-2 rounded-lg transition hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    Tümünü Temizle
                  </button>
                )}
              </div>

              {/* Ücret Filtresi */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Ücret
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateFilter('pricing', undefined)}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: !filters.pricing ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: !filters.pricing ? 'white' : 'var(--text-primary)',
                      border: !filters.pricing ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => updateFilter('pricing', 'free')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.pricing === 'free' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.pricing === 'free' ? 'white' : 'var(--text-primary)',
                      border: filters.pricing === 'free' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Ücretsiz
                  </button>
                  <button
                    onClick={() => updateFilter('pricing', 'paid')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.pricing === 'paid' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.pricing === 'paid' ? 'white' : 'var(--text-primary)',
                      border: filters.pricing === 'paid' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Ücretli
                  </button>
                </div>
              </div>

              {/* Kategori Filtresi */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateFilter('tag', undefined)}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: !filters.tag ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: !filters.tag ? 'white' : 'var(--text-primary)',
                      border: !filters.tag ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'Workshop')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'Workshop' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'Workshop' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'Workshop' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Workshop
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'Career')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'Career' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'Career' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'Career' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Kariyer
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'Networking')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'Networking' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'Networking' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'Networking' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Networking
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'Technical')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'Technical' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'Technical' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'Technical' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    Teknik
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'DeFi')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'DeFi' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'DeFi' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'DeFi' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    DeFi
                  </button>
                  <button
                    onClick={() => updateFilter('tag', 'NFT')}
                    className="px-4 py-2 rounded-lg text-sm transition"
                    style={{
                      backgroundColor: filters.tag === 'NFT' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: filters.tag === 'NFT' ? 'white' : 'var(--text-primary)',
                      border: filters.tag === 'NFT' ? 'none' : '1px solid var(--border-primary)'
                    }}
                  >
                    NFT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <p style={{ color: 'var(--text-secondary)' }}>
              {events.length} etkinlik bulundu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p style={{ color: 'var(--text-secondary)' }}>
                  Filtrelere uygun etkinlik bulunamadı
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
  );
}
