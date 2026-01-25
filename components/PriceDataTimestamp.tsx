'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getPriceDataTimestamp } from '@/lib/scryfall';
import { formatStaticPriceAge } from '@/lib/priceCache';

export default function PriceDataTimestamp() {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceDataTimestamp()
      .then(setTimestamp)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return null;
  }

  const formattedAge = formatStaticPriceAge(timestamp);
  if (!formattedAge) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 text-[var(--text-muted)] text-sm">
      <Clock className="w-3.5 h-3.5" />
      <span>Prices updated {formattedAge}</span>
    </div>
  );
}
