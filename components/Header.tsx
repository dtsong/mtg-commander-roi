'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coins, Plus, BarChart3, Menu, X, Info, BookOpen } from 'lucide-react';

interface HeaderProps {
  onAddDeck?: () => void;
}

export default function Header({ onAddDeck }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b px-4 sm:px-6 py-4 border-[var(--surface-border)]" style={{ backgroundColor: 'var(--header-bg)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">MTG Commander ROI</h1>
            <p className="text-sm text-[var(--text-muted)] hidden sm:block">Precon Value Analyzer</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/about"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 min-h-[44px] transition-colors"
          >
            <Info className="w-4 h-4" />
            About
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 min-h-[44px] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Decks
          </Link>
          {onAddDeck && (
            <button
              onClick={onAddDeck}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Custom Deck
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[var(--surface-border)] space-y-2">
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-3 min-h-[44px] transition-colors"
          >
            <Info className="w-4 h-4" />
            About
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-3 min-h-[44px] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </Link>
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 min-h-[44px] rounded-lg transition-colors w-full"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Decks
          </Link>
          {onAddDeck && (
            <button
              onClick={() => {
                onAddDeck();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 min-h-[44px] rounded-lg transition-colors w-full"
            >
              <Plus className="w-4 h-4" />
              Add Custom Deck
            </button>
          )}
        </div>
      )}
    </header>
  );
}
