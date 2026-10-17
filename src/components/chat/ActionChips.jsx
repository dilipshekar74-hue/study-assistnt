import React from 'react';
import { Lightbulb, BarChart3, AlertTriangle, HelpCircle } from 'lucide-react';

const getChipIcon = (chip) => {
  if (typeof chip?.icon === 'function' || (typeof chip?.icon === 'object' && chip?.icon !== null && chip?.icon.$$typeof)) {
    return chip.icon;
  }
  const label = (chip?.label || '').toLowerCase();
  if (label.includes('hint')) return Lightbulb;
  if (label.includes('intuition') || label.includes('graph') || label.includes('geom')) return BarChart3;
  if (label.includes('pitfall') || label.includes('trap') || label.includes('error')) return AlertTriangle;
  if (label.includes('test') || label.includes('quiz')) return HelpCircle;
  return Lightbulb;
};

export default function ActionChips({ onSelect, onSelectChip, chips: propChips }) {
  const defaultChips = [
    { id: 'hint', label: 'Give me a hint', query: 'Can you provide a gentle hint for the next step?' },
    { id: 'intuition', label: 'Show graphical intuition', query: 'Explain the geometric intuition behind this integral.' },
    { id: 'pitfalls', label: 'Common exam pitfalls', query: 'What mistakes do students usually make here?' },
    { id: 'quiz', label: 'Test my understanding', query: 'Quiz me on this concept with different numbers.' }
  ];

  const chips = propChips && propChips.length > 0 ? propChips : defaultChips;

  const handleClick = (chip) => {
    const textQuery = chip.query || chip.label;
    if (onSelect) onSelect(textQuery);
    if (onSelectChip) onSelectChip(textQuery);
  };

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {chips.map((chip, index) => {
        const Icon = getChipIcon(chip);
        const key = chip.id || chip.label || index;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(chip)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200 transition-all select-none cursor-pointer"
          >
            <Icon className="h-3 w-3 text-indigo-400" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
