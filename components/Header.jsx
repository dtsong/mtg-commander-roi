import Link from 'next/link';
import { Coins, Plus, BarChart3 } from 'lucide-react';

export default function Header({ onAddDeck }) {
  return (
    <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MTG Commander ROI</h1>
            <p className="text-sm text-slate-400">Precon Value Analyzer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Compare Decks
          </Link>
          <button
            onClick={onAddDeck}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Deck
          </button>
        </div>
      </div>
    </header>
  );
}
