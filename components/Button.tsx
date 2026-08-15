import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'var(--accent-gradient)',
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '2px solid var(--border-secondary)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--accent-primary)',
          border: '2px solid var(--accent-primary)'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)'
        };
    }
  };

  return (
    <button 
      className={`${baseStyles} ${className} hover:scale-105 hover:shadow-lg`}
      style={getVariantStyles()}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: 'white' }}></div>
      )}
    </button>
  );
}
