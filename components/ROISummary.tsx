import { DollarSign, Tag, TrendingUp, Truck, AlertCircle } from 'lucide-react';
import { formatCurrency, calculateROI, calculateDistroROI, getDistroCost, getROIVerdict, formatPercentage } from '@/lib/calculations';
import type { PreconDeck } from '@/types';

interface ROISummaryProps {
  deck: PreconDeck | null;
  totalValue: number;
  loading: boolean;
  excludedCount?: number;
}

export default function ROISummary({ deck, totalValue, loading, excludedCount = 0 }: ROISummaryProps) {
  if (!deck) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Select a deck to view ROI analysis</p>
      </div>
    );
  }

  const roi = calculateROI(totalValue, deck.msrp);
  const distroCost = getDistroCost(deck.msrp);
  const distroRoi = calculateDistroROI(totalValue, distroCost);
  const verdict = getROIVerdict(distroRoi, roi);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className={`${verdict.bg} ${verdict.border} border-b p-4 sm:p-6`}>
        <div className="flex flex-col items-center text-center">
          {loading ? (
            <div className="text-slate-400">Loading prices...</div>
          ) : (
            <>
              <div className={`text-4xl sm:text-5xl font-black ${verdict.color} mb-1`}>
                {verdict.label}
              </div>
              {verdict.label === 'DISTRO' && (
                <div className="text-sm text-orange-300 mb-1">Only at distributor pricing</div>
              )}
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {formatCurrency(totalValue)}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-sm">
                <span className={`${distroRoi >= 0 ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                  {formatPercentage(distroRoi)} Distro ROI
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className={`${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(roi)} vs MSRP
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Tag className="w-3 h-3" />
              MSRP
            </div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(deck.msrp)}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Truck className="w-3 h-3" />
              Distro Cost
            </div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(distroCost)}
            </div>
            <div className="text-xs text-slate-500">40% discount</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              Current Value
            </div>
            <div className="text-lg font-bold text-white">
              {loading ? '...' : formatCurrency(totalValue)}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Profit (Distro)
            </div>
            <div className={`text-lg font-bold ${totalValue - distroCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? '...' : `${totalValue - distroCost >= 0 ? '+' : ''}${formatCurrency(totalValue - distroCost)}`}
            </div>
          </div>
        </div>

        {excludedCount > 0 && !loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-500">
            <AlertCircle className="w-4 h-4" />
            {excludedCount} card{excludedCount > 1 ? 's' : ''} excluded (no price data)
          </div>
        )}
      </div>
    </div>
  );
}
