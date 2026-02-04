'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (!adRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      const adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle = adsbygoogle;
      adsbygoogle.push({});
      initialized.current = true;
    } catch {
      console.error('AdSense push failed');
    }
  }, []);

  const getStyle = () => {
    switch (format) {
      case 'rectangle':
        return { display: 'inline-block', width: '300px', height: '250px' };
      case 'horizontal':
        return { display: 'inline-block', width: '728px', height: '90px' };
      case 'vertical':
        return { display: 'inline-block', width: '160px', height: '600px' };
      default:
        return { display: 'block' };
    }
  };

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={getStyle()}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={responsive ? 'auto' : undefined}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}
