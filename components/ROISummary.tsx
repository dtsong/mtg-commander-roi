import { DollarSign, Tag, TrendingUp, Truck, AlertCircle, Loader2, Info } from 'lucide-react';
import { formatCurrency, calculateROI, calculateDistroROI, getDistroCost, getROIVerdict, formatPercentage } from '@/lib/calculations';
import Tooltip from '@/components/ui/Tooltip';
import type { PreconDeck } from '@/types';

const VERDICT_TOOLTIPS: Record<string, string> = {
  BUY: 'Distro ROI >15% with positive MSRP ROI',
  DISTRO: 'Distro ROI >15% but negative MSRP ROI',
  HOLD: 'Distro ROI 0-15%',
  PASS: 'Negative Distro ROI',
};

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
              <Tooltip content={VERDICT_TOOLTIPS[verdict.label]} side="bottom">
                <div className={`text-4xl sm:text-5xl font-black ${verdict.color} mb-1 cursor-help`}>
                  {verdict.label}
                </div>
              </Tooltip>
              {verdict.label === 'DISTRO' && (
                <div className="text-sm text-orange-300 mb-1">Only at distributor pricing</div>
              )}
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums">
                {formatCurrency(totalValue)}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-sm tabular-nums">
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
              <Tag className="w-3 h-3" aria-hidden="true" />
              MSRP
            </div>
            <div className="text-lg font-bold text-white tabular-nums">
              {formatCurrency(deck.msrp)}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Truck className="w-3 h-3" aria-hidden="true" />
              Distro Cost
              <Tooltip content="Game stores buy sealed product at ~40% below MSRP. Distro ROI shows profit at this cost basis.">
                <Info className="w-3 h-3 cursor-help hover:text-slate-300 transition-colors" aria-hidden="true" />
              </Tooltip>
            </div>
            <div className="text-lg font-bold text-white tabular-nums">
              {formatCurrency(distroCost)}
            </div>
            <div className="text-xs text-slate-500">40% discount</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" aria-hidden="true" />
              Current Value
            </div>
            <div className="text-lg font-bold text-white tabular-nums">
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline" aria-hidden="true" /> : formatCurrency(totalValue)}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              Profit (Distro)
            </div>
            <div className={`text-lg font-bold tabular-nums ${totalValue - distroCost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin inline" aria-hidden="true" /> : `${totalValue - distroCost >= 0 ? '+' : ''}${formatCurrency(totalValue - distroCost)}`}
            </div>
          </div>
        </div>

        {excludedCount > 0 && !loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-yellow-500" role="status">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {excludedCount} card{excludedCount > 1 ? 's' : ''} excluded (no price data)
          </div>
        )}
      </div>
    </div>
  );
}
