// ============================================================================
// Small shared UI primitives
// ============================================================================
import type { ReactNode } from 'react';
import type { TicketStatus } from '../types';

export function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { label: string; cls: string }> = {
    'Queued on Device (Offline)': {
      label: '🟠 Queued on Device',
      cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    },
    'Synced - Ready to Bill': {
      label: '🔵 Synced — Ready to Bill',
      cls: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    },
    'Needs Review': {
      label: '🟣 Needs Review',
      cls: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
    },
    'Billed in QuickBooks': {
      label: '🟢 Billed in QuickBooks',
      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    },
  };
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
        {required && <span className="text-amber-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-rig-border bg-rig-bg px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 ${
        props.className ?? ''
      }`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-rig-border bg-rig-bg px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 ${
        props.className ?? ''
      }`}
    />
  );
}

export function Modal({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`my-8 w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} animate-pop-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent: 'amber' | 'emerald' | 'sky' | 'violet';
}) {
  const ring: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-500/0 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-emerald-500/0 border-emerald-500/30',
    sky: 'from-sky-500/20 to-sky-500/0 border-sky-500/30',
    violet: 'from-violet-500/20 to-violet-500/0 border-violet-500/30',
  };
  return (
    <div className={`@container rounded-xl border bg-gradient-to-b ${ring[accent]} p-2.5 @sm:p-4`}>
      <div className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-400 @sm:text-xs">{label}</div>
      <div className="mt-1 break-words font-mono text-base font-bold text-slate-50 @sm:mt-1.5 @sm:text-2xl">{value}</div>
      {sub && <div className="mt-1 text-[10px] leading-tight text-slate-400 @sm:text-xs">{sub}</div>}
    </div>
  );
}
