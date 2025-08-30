import React from 'react';

interface TagChipProps {
  tag: string;
  variant?: 'default' | 'risk' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

export function TagChip({ tag, variant = 'default', size = 'sm' }: TagChipProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    risk: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${sizeClasses[size]}
      ${variantClasses[variant]}
    `}>
      {tag}
    </span>
  );
}