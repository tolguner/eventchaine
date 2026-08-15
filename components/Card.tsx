import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`rounded-xl transition-all ${
        padding ? 'p-6' : ''
      } ${className}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {children}
    </div>
  );
}
