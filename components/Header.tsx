'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Safely get theme context - will be undefined during SSR
  let theme = 'light';
  let toggleTheme = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // Theme context not available during SSR
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }} className="backdrop-blur-md border-b sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative flex items-center space-x-3">
              {/* Tech Circuit Icon */}
              <svg 
                className="h-10 w-10 transition-all group-hover:scale-110 group-hover:rotate-180" 
                style={{ color: 'var(--accent-primary)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
              <span className="text-xl font-bold" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                IT&MIS Kulübü
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`relative font-medium transition-all ${
                isActive('/') 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-primary'
              } group`}
            >
              <span className="relative z-10">Ana Sayfa</span>
              {isActive('/') && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              )}
            </Link>
            <Link 
              href="/events" 
              className={`relative font-medium transition-all ${
                isActive('/events') 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-primary'
              } group`}
            >
              <span className="relative z-10">Etkinlikler</span>
              {isActive('/events') && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              )}
            </Link>
            <Link 
              href="/blog" 
              className={`relative font-medium transition-all ${
                isActive('/blog') 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-primary'
              } group`}
            >
              <span className="relative z-10">Blog</span>
              {isActive('/blog') && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              )}
            </Link>
            <Link 
              href="/about" 
              className={`relative font-medium transition-all ${
                isActive('/about') 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-primary'
              } group`}
            >
              <span className="relative z-10">Hakkında</span>
              {isActive('/about') && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              )}
            </Link>
            <Link 
              href="/contact" 
              className={`relative font-medium transition-all ${
                isActive('/contact') 
                  ? 'text-primary' 
                  : 'text-text-secondary hover:text-primary'
              } group`}
            >
              <span className="relative z-10">İletişim</span>
              {isActive('/contact') && (
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              )}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--accent-primary)'
                }}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="hidden md:block px-4 py-2 bg-secondary/20 text-secondary border border-secondary/50 rounded-xl hover:bg-secondary/30 hover:shadow-neon-blue transition font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onMouseEnter={() => setShowDropdown(true)}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition group"
                    style={{ 
                      backgroundColor: theme === 'light' ? 'rgba(250, 158, 15, 0.05)' : 'transparent',
                      border: `1px solid ${theme === 'light' ? 'rgba(250, 158, 15, 0.2)' : 'rgba(250, 158, 15, 0.3)'}`,
                    }}
                  >
                    {/* Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition"
                      style={{
                        background: theme === 'light' 
                          ? 'linear-gradient(135deg, #fa9e0f, #ff8c42)' 
                          : 'linear-gradient(135deg, #fa9e0f, #0346b9)',
                        color: 'white'
                      }}
                    >
                      {user.name === 'Yeni Kullanıcı' ? '?' : user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Name - Hidden on mobile */}
                    <div className="hidden md:block text-left">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name === 'Yeni Kullanıcı' ? 'Profili Tamamla' : user.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email || user.walletAddress?.slice(0, 12) + '...'}</p>
                    </div>

                    {/* Dropdown Arrow */}
                    <svg 
                      className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                    {showDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-64 backdrop-blur-md rounded-2xl shadow-cyber py-2 z-50"
                      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}
                      onMouseLeave={() => setShowDropdown(false)}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                            style={{
                              background: theme === 'light' 
                                ? 'linear-gradient(135deg, #fa9e0f, #ff8c42)' 
                                : 'linear-gradient(135deg, #fa9e0f, #0346b9)',
                              color: 'white'
                            }}
                          >
                            {user.name === 'Yeni Kullanıcı' ? '?' : user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name === 'Yeni Kullanıcı' ? 'Profili Tamamla' : user.name}</p>
                            <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{user.email || (user.walletAddress?.slice(0, 12) + '...')}</p>
                          </div>
                        </div>
                        {user.walletAddress && (
                          <div className="mt-2 flex items-center gap-2 text-xs rounded-lg px-2 py-1" style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="truncate">{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}</span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 transition group"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Profilim</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bilgilerini görüntüle</p>
                          </div>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 transition group"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition">
                              <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Admin Panel</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Yönetim paneli</p>
                            </div>
                          </Link>
                        )}

                        <Link
                          href="/events"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 transition group"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Etkinlikler</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tüm etkinlikleri gör</p>
                          </div>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition group"
                        >
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-red-600 text-sm">Çıkış Yap</p>
                            <p className="text-xs text-red-400">Hesaptan çık</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link 
                href="/auth/signin" 
                className="px-6 py-2.5 rounded-xl hover:shadow-cyber transition font-bold relative overflow-hidden group"
                style={{ background: 'var(--accent-gradient)', color: 'white' }}
              >
                <span className="relative z-10">🔐 Cüzdan ile Giriş</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--accent-gradient-hover)' }}></div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
