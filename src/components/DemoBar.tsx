// ============================================================================
// Persistent Top Demo Control Bar — view switcher, network toggle, reset.
// ============================================================================
import { Smartphone, Monitor, Columns, RotateCcw, Wifi, WifiOff, Truck } from 'lucide-react';
import type { ViewMode } from '../types';
import { useStore } from '../store';

interface Props {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}

export default function DemoBar({ view, setView }: Props) {
  const { network, setNetwork, resetDemo, queuedCount } = useStore();
  const offline = network === 'offline';

  const viewBtn = (mode: ViewMode, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setView(mode)}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        view === mode
          ? 'bg-amber-500 text-slate-900 shadow'
          : 'text-slate-300 hover:bg-rig-card'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <header className="no-print sticky top-0 z-40 border-b border-rig-border bg-rig-panel/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:px-4">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500 text-slate-900">
            <Truck size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-mono text-sm font-bold tracking-tight text-amber-400">
              RigTicket<span className="text-slate-200"> Sync</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Oilfield Field Ticketing
            </div>
          </div>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-rig-border bg-rig-bg p-1">
          {viewBtn('driver', <Smartphone size={16} />, '📱 Driver Field PWA')}
          {viewBtn('office', <Monitor size={16} />, '🖥️ Back-Office Portal')}
          {viewBtn('split', <Columns size={16} />, '⚡ Split-Screen Live')}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Network toggle */}
          <button
            onClick={() => setNetwork(offline ? 'online' : 'offline')}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
              offline
                ? 'border-red-500/50 bg-red-500/15 text-red-300'
                : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
            }`}
            title="Toggle simulated cellular connectivity"
          >
            {offline ? <WifiOff size={16} className="shrink-0" /> : <Wifi size={16} className="shrink-0" />}
            <span className="hidden sm:inline">
              {offline ? '🔴 OFFLINE — DEAD ZONE (0 Bars)' : '🟢 ONLINE — 4G LTE Connected'}
            </span>
            <span className="sm:hidden">{offline ? '🔴 OFFLINE' : '🟢 ONLINE'}</span>
            {offline && queuedCount > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 font-mono text-[10px] text-white">
                {queuedCount} queued
              </span>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 rounded-xl border border-rig-border bg-rig-bg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-rig-card"
            title="Reset all demo data to seed"
          >
            <RotateCcw size={15} className="shrink-0" />
            <span className="hidden lg:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
