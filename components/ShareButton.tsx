'use client';

import { useState, useCallback } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  deckId: string;
  deckName: string;
}

export default function ShareButton({ deckId, deckName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/deck/${deckId}`;
  }, [deckId]);

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url = getShareUrl();

    if (canShare) {
      try {
        await navigator.share({
          title: `${deckName} - MTG Commander ROI`,
          url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  }, [canShare, copyToClipboard, deckName, getShareUrl]);

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
      title={canShare ? 'Share deck' : 'Copy link'}
      aria-label={canShare ? 'Share deck' : 'Copy link to clipboard'}
    >
      {canShare ? (
        <Share2 className="w-5 h-5" />
      ) : copied ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
    </button>
  );
}
