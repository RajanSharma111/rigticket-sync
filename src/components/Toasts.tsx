// ============================================================================
// Toast notifications + global sync progress bar.
// ============================================================================
import { CheckCircle2, X, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  const icon = {
    sync: <RefreshCw size={18} className="text-sky-400" />,
    bill: <CheckCircle2 size={18} className="text-emerald-400" />,
    info: <Info size={18} className="text-slate-300" />,
    warn: <AlertTriangle size={18} className="text-amber-400" />,
  };
  return (
    <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-slide-in rounded-xl border border-rig-border bg-rig-card p-3 shadow-2xl"
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{icon[t.kind]}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">{t.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">{t.message}</div>
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SyncOverlay() {
  const { syncProgress } = useStore();
  if (!syncProgress.active) return null;
  return (
    <div className="no-print fixed left-1/2 top-16 z-[55] w-[92%] max-w-md -translate-x-1/2">
      <div className="animate-pop-in rounded-xl border border-sky-500/40 bg-rig-card p-4 shadow-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
          <RefreshCw size={16} className="animate-spin" />
          {syncProgress.label}
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-rig-bg">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${syncProgress.pct}%` }}
          />
        </div>
        <div className="mt-1.5 text-right font-mono text-[11px] text-slate-400">
          {Math.round(syncProgress.pct)}%
        </div>
      </div>
    </div>
  );
}
