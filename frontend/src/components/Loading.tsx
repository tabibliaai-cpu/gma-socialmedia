export default function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-t-primary-500 border-gray-700 rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-300">
      <Loading size="lg" />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Loading size="lg" />
    </div>
  );
}

export function LoadingInline({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Loading size="sm" />
      <span>{text}</span>
    </div>
  );
}
