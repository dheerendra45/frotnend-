export function LoadingSpinner({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg', color?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className={`w-full h-full border-4 border-gray-600 border-t-${color}-500 rounded-full`}></div>
      </div>
    </div>
  );
}
