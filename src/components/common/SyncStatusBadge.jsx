import React from 'react';
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';

/**
 * SyncStatusBadge
 * Dynamic cloud multi-device sync status badge for ved.ai top bars.
 * Displays synced (emerald), syncing (amber/spin), error (rose), and offline (zinc) indicators.
 */
export default function SyncStatusBadge({ className = '' }) {
  const { syncStatus } = useSessionStore();

  const configs = {
    synced: {
      icon: Cloud,
      label: 'Synced',
      dotColor: 'bg-emerald-400',
      badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
      tooltip: 'Real-time multi-device cloud sync active'
    },
    syncing: {
      icon: Loader2,
      spin: true,
      label: 'Syncing...',
      dotColor: 'bg-amber-400',
      badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
      tooltip: 'Debouncing and syncing derivations to Supabase...'
    },
    error: {
      icon: AlertCircle,
      label: 'Sync Error',
      dotColor: 'bg-rose-400',
      badgeClass: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
      tooltip: 'Retrying sync on next network heartbeat'
    },
    offline: {
      icon: CloudOff,
      label: 'Offline (Local)',
      dotColor: 'bg-zinc-400',
      badgeClass: 'border-white/10 bg-white/[0.04] text-zinc-400',
      tooltip: 'Working offline: state preserved in local storage'
    }
  };

  const current = configs[syncStatus] || configs.synced;
  const Icon = current.icon;

  return (
    <div
      title={current.tooltip}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono transition-all select-none ${current.badgeClass} ${className}`}
    >
      <Icon className={`h-3 w-3 ${current.spin ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline font-medium">{current.label}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dotColor} ${syncStatus === 'syncing' ? 'animate-pulse' : ''}`} />
    </div>
  );
}
