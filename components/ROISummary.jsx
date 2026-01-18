import { DollarSign, Tag, TrendingUp } from 'lucide-react';
import { formatCurrency, calculateROI } from '@/lib/calculations';
import ROIBadge from './ROIBadge';

export default function ROISummary({ deck, totalValue, loading }) {
  if (!deck) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Select a deck to view ROI analysis</p>
      </div>
    );
  }

  const roi = calculateROI(totalValue, deck.msrp);
  const valueDiff = totalValue - deck.msrp;

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{deck.name}</h2>
          <p className="text-slate-400">{deck.set} ({deck.year})</p>
        </div>
        {!loading && <ROIBadge roi={roi} size="lg" />}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Tag className="w-4 h-4" />
            Original MSRP
          </div>
          <div className="text-xl font-bold text-white">
            {formatCurrency(deck.msrp)}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Current Value
          </div>
          <div className="text-xl font-bold text-white">
            {loading ? (
              <span className="text-slate-500">Loading...</span>
            ) : (
              formatCurrency(totalValue)
            )}
          </div>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Value Difference
          </div>
          <div className={`text-xl font-bold ${valueDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {loading ? (
              <span className="text-slate-500">Loading...</span>
            ) : (
              `${valueDiff >= 0 ? '+' : ''}${formatCurrency(valueDiff)}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
