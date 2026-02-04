'use client';

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { X, Plus } from 'lucide-react';
import type { PreconDeck, CustomDeckFormData } from '@/types';

interface AddDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deck: PreconDeck) => void;
}

export default function AddDeckModal({ isOpen, onClose, onAdd }: AddDeckModalProps) {
  const [formData, setFormData] = useState<CustomDeckFormData>({
    name: '',
    set: '',
    year: new Date().getFullYear(),
    msrp: '',
    setCode: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.msrp) return;

    onAdd({
      id: `custom-${Date.now()}`,
      name: formData.name,
      set: formData.set || 'Custom',
      year: Number(formData.year),
      msrp: Number(formData.msrp),
      setCode: formData.setCode || '',
      colors: [],
      isCustom: true,
    });

    setFormData({
      name: '',
      set: '',
      year: new Date().getFullYear(),
      msrp: '',
      setCode: '',
    });
    onClose();
  };

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement;
    document.addEventListener('keydown', handleKeyDown);
    const firstInput = dialogRef.current?.querySelector<HTMLElement>('input');
    firstInput?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-deck-title"
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 id="add-deck-title" className="text-lg font-semibold text-white">Add Custom Deck</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="deck-name" className="block text-sm text-slate-400 mb-1">Deck Name *</label>
            <input
              type="text"
              id="deck-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoComplete="off"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              placeholder="e.g., My Custom Deck"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="set-name" className="block text-sm text-slate-400 mb-1">Set Name</label>
            <input
              type="text"
              id="set-name"
              value={formData.set}
              onChange={(e) => setFormData({ ...formData, set: e.target.value })}
              autoComplete="off"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              placeholder="e.g., Commander 2024"
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deck-year" className="block text-sm text-slate-400 mb-1">Year</label>
              <input
                type="number"
                id="deck-year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                inputMode="numeric"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 tabular-nums"
                min="2000"
                max="2030"
              />
            </div>
            <div>
              <label htmlFor="deck-msrp" className="block text-sm text-slate-400 mb-1">MSRP (USD) *</label>
              <input
                type="number"
                id="deck-msrp"
                value={formData.msrp}
                onChange={(e) => setFormData({ ...formData, msrp: e.target.value })}
                inputMode="decimal"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 tabular-nums"
                placeholder="49.99"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="set-code" className="block text-sm text-slate-400 mb-1">Scryfall Set Code (optional)</label>
            <input
              type="text"
              id="set-code"
              value={formData.setCode}
              onChange={(e) => setFormData({ ...formData, setCode: e.target.value.toLowerCase() })}
              autoComplete="off"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              placeholder="e.g., dsc"
              maxLength={5}
            />
            <p className="text-xs text-slate-500 mt-1">
              Find codes at scryfall.com/sets
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
