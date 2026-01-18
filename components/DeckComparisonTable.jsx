'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import ColorIndicator from './ColorIndicator';
import ROIBadge from './ROIBadge';
import { formatCurrency, calculateROI } from '@/lib/calculations';
import { formatCacheAge, isCacheStale } from '@/lib/priceCache';

const SortHeader = ({ label, sortKey, currentSort, onSort }) => {
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
};

export default function DeckComparisonTable({
  decks,
  priceData,
  loadingDeck,
  onLoadPrice,
  onRefreshPrice,
}) {
  const [sort, setSort] = useState({ key: 'roi', direction: 'desc' });
  const [filter, setFilter] = useState({ year: 'all', set: 'all' });

  const years = useMemo(() => {
    const uniqueYears = [...new Set(decks.map(d => d.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [decks]);

  const sets = useMemo(() => {
    const uniqueSets = [...new Set(decks.map(d => d.set))];
    return uniqueSets.sort();
  }, [decks]);

  const handleSort = (key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const filteredAndSortedDecks = useMemo(() => {
    let result = [...decks];

    if (filter.year !== 'all') {
      result = result.filter(d => d.year === parseInt(filter.year));
    }
    if (filter.set !== 'all') {
      result = result.filter(d => d.set === filter.set);
    }

    result.sort((a, b) => {
      const aData = priceData[a.id];
      const bData = priceData[b.id];
      let aVal, bVal;

      switch (sort.key) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'set':
          aVal = a.set;
          bVal = b.set;
          break;
        case 'year':
          aVal = a.year;
          bVal = b.year;
          break;
        case 'msrp':
          aVal = a.msrp;
          bVal = b.msrp;
          break;
        case 'value':
          aVal = aData?.totalValue ?? -1;
          bVal = bData?.totalValue ?? -1;
          break;
        case 'roi':
          aVal = aData ? calculateROI(aData.totalValue, a.msrp) : -999;
          bVal = bData ? calculateROI(bData.totalValue, b.msrp) : -999;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sort.direction === 'asc' ? cmp : -cmp;
      }

      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [decks, filter, sort, priceData]);

  const stats = useMemo(() => {
    const loadedDecks = decks.filter(d => priceData[d.id]);
    const rois = loadedDecks.map(d => calculateROI(priceData[d.id].totalValue, d.msrp));
    const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;
    const positiveCount = rois.filter(r => r > 0).length;

    return {
      total: decks.length,
      loaded: loadedDecks.length,
      avgRoi,
      positiveCount,
    };
  }, [decks, priceData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filter.year}
            onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filter.set}
            onChange={(e) => setFilter(prev => ({ ...prev, set: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Sets</option>
            {sets.map(set => (
              <option key={set} value={set}>{set}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-slate-400">
          {stats.loaded}/{stats.total} loaded
          {stats.loaded > 0 && (
            <span className="ml-3">
              Avg ROI: <span className={stats.avgRoi >= 0 ? 'text-green-400' : 'text-red-400'}>
                {stats.avgRoi >= 0 ? '+' : ''}{stats.avgRoi.toFixed(1)}%
              </span>
              <span className="mx-2">|</span>
              {stats.positiveCount} positive
            </span>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
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
                  <SortHeader label="ROI" sortKey="roi" currentSort={sort} onSort={handleSort} />
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
                            <AlertTriangle className="w-4 h-4 text-yellow-500" title="Stale data" />
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
                        disabled={isLoading || loadingDeck}
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
