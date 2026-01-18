import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPercentage } from '@/lib/calculations';

interface ROIBadgeProps {
  roi: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ROIBadge({ roi, size = 'md' }: ROIBadgeProps) {
  const isPositive = roi >= 0;
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeClasses[size]} ${
        isPositive
          ? 'bg-green-600/20 text-green-400'
          : 'bg-red-600/20 text-red-400'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      {formatPercentage(roi)}
    </span>
  );
}
