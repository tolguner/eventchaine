import React from 'react';

interface ChipProps {
  label: string;
  color?: 'gray' | 'primary' | 'secondary' | 'red' | 'green';
  size?: 'sm' | 'md';
}

export function Chip({ label, color = 'gray', size = 'md' }: ChipProps) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    primary: 'bg-green-100 text-green-800',
    secondary: 'bg-cyan-100 text-cyan-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
