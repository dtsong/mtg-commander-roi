import type { ManaColor } from '@/types';

const COLOR_STYLES: Record<ManaColor, string> = {
  W: 'bg-amber-100 text-amber-800',
  U: 'bg-blue-100 text-blue-800',
  B: 'bg-gray-800 text-gray-100',
  R: 'bg-red-100 text-red-800',
  G: 'bg-green-100 text-green-800',
  C: 'bg-gray-200 text-gray-700',
};

const COLOR_NAMES: Record<ManaColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  C: 'Colorless',
};

interface ColorIndicatorProps {
  colors: ManaColor[];
}

export default function ColorIndicator({ colors }: ColorIndicatorProps) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex gap-1">
      {colors.map(color => (
        <span
          key={color}
          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${COLOR_STYLES[color] || COLOR_STYLES.C}`}
          title={COLOR_NAMES[color]}
        >
          {color}
        </span>
      ))}
    </div>
  );
}
