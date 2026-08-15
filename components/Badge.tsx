import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'gray';
  className?: string;
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const getVariantStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          backgroundColor: 'rgba(250, 158, 15, 0.15)',
          color: '#fa9e0f',
          border: '1px solid rgba(250, 158, 15, 0.3)'
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(3, 70, 185, 0.15)',
          color: '#0346b9',
          border: '1px solid rgba(3, 70, 185, 0.3)'
        };
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        };
      case 'gray':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-primary)'
        };
    }
  };

  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${className}`}
      style={getVariantStyle()}
    >
      {children}
    </span>
  );
}
