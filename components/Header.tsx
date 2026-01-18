'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coins, Plus, BarChart3, Mail, Menu, X } from 'lucide-react';

interface HeaderProps {
  onAddDeck: () => void;
}

export default function Header({ onAddDeck }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-800/50 border-b border-slate-700 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MTG Commander ROI</h1>
            <p className="text-sm text-slate-400 hidden sm:block">Precon Value Analyzer</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="mailto:support@auratcg.com"
            className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 min-h-[44px] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Feedback
          </a>
          <Link
            href="/compare"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Decks
          </Link>
          <button
            onClick={onAddDeck}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Deck
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-700 space-y-2">
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 min-h-[44px] rounded-lg transition-colors w-full"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Decks
          </Link>
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
          <a
            href="mailto:support@auratcg.com"
            className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-3 min-h-[44px] transition-colors"
          >
            <Mail className="w-4 h-4" />
            Feedback
          </a>
        </div>
      )}
    </header>
  );
}
