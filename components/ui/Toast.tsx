'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  loading: Loader2,
};

const styles = {
  success: 'bg-green-900/90 border-green-700 text-green-100',
  error: 'bg-red-900/90 border-red-700 text-red-100',
  info: 'bg-slate-800/90 border-slate-600 text-slate-100',
  loading: 'bg-slate-800/90 border-slate-600 text-slate-100',
};

const iconStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  loading: 'text-purple-400 animate-spin',
};

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    if (type === 'loading') return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[280px] max-w-md animate-in slide-in-from-right-5 fade-in ${styles[type]}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconStyles[type]}`} />
      <span className="flex-1 text-sm">{message}</span>
      {type !== 'loading' && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
