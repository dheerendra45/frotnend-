import { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlowingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function GlowingButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  glow = true,
  className = '',
  ...props 
}: GlowingButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const glowClasses = glow ? {
    primary: 'hover:shadow-blue-500/25 focus:ring-blue-500/50',
    secondary: 'hover:shadow-gray-500/25 focus:ring-gray-500/50',
    success: 'hover:shadow-green-500/25 focus:ring-green-500/50',
    warning: 'hover:shadow-yellow-500/25 focus:ring-yellow-500/50',
    danger: 'hover:shadow-red-500/25 focus:ring-red-500/50'
  }[variant] : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
