'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import ColorIndicator from './ColorIndicator';
import ROIBadge from './ROIBadge';
import { formatCurrency, calculateROI, calculateDistroROI, getDistroCost, formatPercentage, getROIVerdict } from '@/lib/calculations';
import { formatCacheAge, isCacheStale } from '@/lib/priceCache';
import type { PreconDeck, CachedPriceData, SortState, FilterState } from '@/types';

interface SortHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortState;
  onSort: (key: string) => void;
}

const SortHeader = memo(function SortHeader({ label, sortKey, currentSort, onSort }: SortHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const Icon = isActive && currentSort.direction === 'asc' ? ChevronUp : ChevronDown;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 font-semibold hover:text-purple-400 transition-colors ${
        isActive ? 'text-purple-400' : 'text-slate-300'
      }`}
    >
      {label}
      <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
    </button>
  );
});

const ROI_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'positive', label: 'Positive ROI' },
  { value: 'over20', label: '>20% ROI' },
  { value: 'buy', label: 'BUY (>15%)' },
  { value: 'negative', label: 'Negative ROI' },
  { value: 'hits', label: '3+ $10 Cards' },
];

interface DeckComparisonTableProps {
  decks: PreconDeck[];
  priceData: Record<string, CachedPriceData>;
  loadingDeck: string | null;
  onLoadPrice: (deck: PreconDeck) => void;
  onRefreshPrice: (deck: PreconDeck) => void;
}

export default function DeckComparisonTable({
  decks,
  priceData,
  loadingDeck,
  onLoadPrice,
  onRefreshPrice,
}: DeckComparisonTableProps) {
  const [sort, setSort] = useState<SortState>({ key: 'distroRoi', direction: 'desc' });
  const [filter, setFilter] = useState<FilterState>({ year: 'all', set: 'all', roiThreshold: 'all' });

  const years = useMemo(() => {
    const uniqueYears = [...new Set(decks.map(d => d.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [decks]);

  const sets = useMemo(() => {
    const uniqueSets = [...new Set(decks.map(d => d.set))];
    return uniqueSets.sort();
  }, [decks]);

  const handleSort = useCallback((key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const filteredAndSortedDecks = useMemo(() => {
    const decksWithMetrics = decks.map(deck => {
      const data = priceData[deck.id];
      const distroCost = getDistroCost(deck.msrp);
      const highValueCount = data?.topCards?.filter(c => c.price >= 10).length ?? 0;
      return {
        deck,
        roi: data ? calculateROI(data.totalValue, deck.msrp) : -999,
        distroRoi: data ? calculateDistroROI(data.totalValue, distroCost) : -999,
        value: data?.totalValue ?? -1,
        highValueCount,
      };
    });

    let result = decksWithMetrics;

    if (filter.year !== 'all') {
      result = result.filter(d => d.deck.year === parseInt(filter.year));
    }
    if (filter.set !== 'all') {
      result = result.filter(d => d.deck.set === filter.set);
    }

    if (filter.roiThreshold !== 'all') {
      result = result.filter(d => {
        if (d.distroRoi === -999) return false;
        switch (filter.roiThreshold) {
          case 'positive':
            return d.distroRoi > 0;
          case 'over20':
            return d.distroRoi > 20;
          case 'buy':
            return d.distroRoi > 15;
          case 'negative':
            return d.distroRoi < 0 || d.roi < 0;
          case 'hits':
            return d.highValueCount >= 3;
          default:
            return true;
        }
      });
    }

    result.sort((a, b) => {
      let aVal: number | string, bVal: number | string;

      switch (sort.key) {
        case 'name':
          aVal = a.deck.name;
          bVal = b.deck.name;
          break;
        case 'set':
          aVal = a.deck.set;
          bVal = b.deck.set;
          break;
        case 'year':
          aVal = a.deck.year;
          bVal = b.deck.year;
          break;
        case 'msrp':
          aVal = a.deck.msrp;
          bVal = b.deck.msrp;
          break;
        case 'value':
          aVal = a.value;
          bVal = b.value;
          break;
        case 'roi':
          aVal = a.roi;
          bVal = b.roi;
          break;
        case 'distroRoi':
          aVal = a.distroRoi;
          bVal = b.distroRoi;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sort.direction === 'asc' ? cmp : -cmp;
      }

      return sort.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result.map(r => r.deck);
  }, [decks, filter, sort, priceData]);

  const stats = useMemo(() => {
    let loaded = 0, sum = 0, positiveCount = 0, buyCount = 0;

    for (const deck of decks) {
      const data = priceData[deck.id];
      if (!data) continue;
      loaded++;
      const distroCost = getDistroCost(deck.msrp);
      const roi = calculateDistroROI(data.totalValue, distroCost);
      sum += roi;
      if (roi > 0) positiveCount++;
      if (roi > 15) buyCount++;
    }

    return {
      total: decks.length,
      loaded,
      avgDistroRoi: loaded > 0 ? sum / loaded : 0,
      positiveCount,
      buyCount,
    };
  }, [decks, priceData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          <select
            value={filter.year}
            onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white text-sm flex-1 sm:flex-none"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filter.set}
            onChange={(e) => setFilter(prev => ({ ...prev, set: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white text-sm flex-1 sm:flex-none"
          >
            <option value="all">All Sets</option>
            {sets.map(set => (
              <option key={set} value={set}>{set}</option>
            ))}
          </select>

          <select
            value={filter.roiThreshold}
            onChange={(e) => setFilter(prev => ({ ...prev, roiThreshold: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white text-sm flex-1 sm:flex-none"
          >
            {ROI_FILTERS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-slate-400">
          {stats.loaded}/{stats.total} loaded
          {stats.loaded > 0 && (
            <span className="ml-3">
              Avg Distro ROI: <span className={stats.avgDistroRoi >= 0 ? 'text-green-400' : 'text-red-400'}>
                {stats.avgDistroRoi >= 0 ? '+' : ''}{stats.avgDistroRoi.toFixed(1)}%
              </span>
              <span className="mx-2">|</span>
              <span className="text-green-400">{stats.buyCount} BUY</span>
            </span>
          )}
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedDecks.map(deck => {
          const data = priceData[deck.id];
          const isLoading = loadingDeck === deck.id;
          const roi = data ? calculateROI(data.totalValue, deck.msrp) : null;
          const distroCost = getDistroCost(deck.msrp);
          const distroRoi = data ? calculateDistroROI(data.totalValue, distroCost) : null;

          return (
            <div key={deck.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/deck/${deck.id}`}
                    className="font-medium text-white hover:text-purple-400 block truncate"
                  >
                    {deck.name}
                  </Link>
                  <div className="text-sm text-slate-400 mt-1">{deck.set} ({deck.year})</div>
                </div>
                <ColorIndicator colors={deck.colors} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-xs text-slate-400">MSRP</div>
                  <div className="text-white font-medium">{formatCurrency(deck.msrp)}</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-xs text-slate-400">Value</div>
                  <div className="text-white font-medium">
                    {isLoading ? '...' : data ? formatCurrency(data.totalValue) : '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {distroRoi !== null && roi !== null && (
                    <span className={`font-bold ${getROIVerdict(distroRoi, roi).color}`}>
                      {formatPercentage(distroRoi)}
                    </span>
                  )}
                  {roi !== null && <ROIBadge roi={roi} size="sm" />}
                </div>
                <button
                  onClick={() => data ? onRefreshPrice(deck) : onLoadPrice(deck)}
                  disabled={isLoading || !!loadingDeck}
                  className={`inline-flex items-center gap-1 px-4 py-2 min-h-[44px] rounded-lg text-sm transition-colors ${
                    isLoading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : loadingDeck
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : data
                          ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {data ? 'Refresh' : 'Load'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Deck" sortKey="name" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Set" sortKey="set" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left">Colors</th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="MSRP" sortKey="msrp" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortHeader label="Value" sortKey="value" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader label="Distro ROI" sortKey="distroRoi" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">
                  <SortHeader label="MSRP ROI" sortKey="roi" currentSort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-center">Updated</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredAndSortedDecks.map(deck => {
                const data = priceData[deck.id];
                const isLoading = loadingDeck === deck.id;
                const stale = data && isCacheStale(deck.id);
                const roi = data ? calculateROI(data.totalValue, deck.msrp) : null;
                const distroCost = getDistroCost(deck.msrp);
                const distroRoi = data ? calculateDistroROI(data.totalValue, distroCost) : null;

                return (
                  <tr key={deck.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/deck/${deck.id}`}
                        className="font-medium text-white hover:text-purple-400 hover:underline cursor-pointer"
                      >
                        {deck.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{deck.set}</td>
                    <td className="px-4 py-3">
                      <ColorIndicator colors={deck.colors} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {formatCurrency(deck.msrp)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />
                      ) : data ? (
                        <span className="text-white font-medium">
                          {formatCurrency(data.totalValue)}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLoading ? (
                        <span className="text-slate-500">...</span>
                      ) : distroRoi !== null && roi !== null ? (
                        <span className={`font-bold ${getROIVerdict(distroRoi, roi).color}`}>
                          {formatPercentage(distroRoi)}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLoading ? (
                        <span className="text-slate-500">...</span>
                      ) : roi !== null ? (
                        <ROIBadge roi={roi} size="sm" />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {data ? (
                        <div className="flex items-center justify-center gap-1">
                          {stale && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className={`text-sm ${stale ? 'text-yellow-500' : 'text-green-400'}`}>
                            {formatCacheAge(deck.id)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => data ? onRefreshPrice(deck) : onLoadPrice(deck)}
                        disabled={isLoading || !!loadingDeck}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                          isLoading
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : loadingDeck
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : data
                                ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {data ? 'Refresh' : 'Load'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
