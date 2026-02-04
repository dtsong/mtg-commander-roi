'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const positionClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses: Record<TooltipSide, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700 border-y-transparent border-l-transparent',
};

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  side = 'top',
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualSide, setActualSide] = useState(side);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Handle viewport overflow
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newSide = side;

    // Check if tooltip overflows viewport and flip if needed
    if (side === 'top' && rect.top < 0) {
      newSide = 'bottom';
    } else if (side === 'bottom' && rect.bottom > viewportHeight) {
      newSide = 'top';
    } else if (side === 'left' && rect.left < 0) {
      newSide = 'right';
    } else if (side === 'right' && rect.right > viewportWidth) {
      newSide = 'left';
    }

    if (newSide !== actualSide) {
      setActualSide(newSide);
    }
  }, [isVisible, side, actualSide]);

  // Reset side when tooltip hides
  useEffect(() => {
    if (!isVisible) {
      setActualSide(side);
    }
  }, [isVisible, side]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={triggerRef}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 px-3 py-2 text-sm text-slate-200 bg-slate-700 rounded-lg shadow-lg whitespace-normal max-w-xs ${positionClasses[actualSide]}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[actualSide]}`}
          />
        </div>
      )}
    </div>
  );
}
