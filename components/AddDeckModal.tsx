'use client';

import { useState, FormEvent } from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Add Custom Deck</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Deck Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., My Custom Deck"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Set Name</label>
            <input
              type="text"
              value={formData.set}
              onChange={(e) => setFormData({ ...formData, set: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Commander 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="2000"
                max="2030"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">MSRP (USD) *</label>
              <input
                type="number"
                value={formData.msrp}
                onChange={(e) => setFormData({ ...formData, msrp: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="49.99"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Scryfall Set Code (optional)</label>
            <input
              type="text"
              value={formData.setCode}
              onChange={(e) => setFormData({ ...formData, setCode: e.target.value.toLowerCase() })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
