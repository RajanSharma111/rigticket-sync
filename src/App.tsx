// ============================================================================
// RigTicket Sync — App shell: demo bar + view modes + split-screen.
// ============================================================================
import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { ViewMode } from './types';
import { StoreProvider } from './store';
import DemoBar from './components/DemoBar';
import DriverApp from './components/DriverApp';
import OfficePortal from './components/OfficePortal';
import { Toasts, SyncOverlay } from './components/Toasts';

export default function App({ onHome }: { onHome?: () => void }) {
  const [view, setView] = useState<ViewMode>('split');
  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col bg-rig-bg text-slate-200">
        <DemoBar view={view} setView={setView} onHome={onHome} />
        <main className="min-h-0 flex-1 overflow-hidden">
          {view === 'driver' && <DriverStage />}
          {view === 'office' && <OfficePortal />}
          {view === 'split' && <SplitStage />}
        </main>
        <SyncOverlay />
        <Toasts />
      </div>
    </StoreProvider>
  );
}

/** Driver PWA shown inside a ruggedized tablet frame. */
function DriverStage() {
  return (
    <div className="flex h-full justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_top,#132037,#0b1120)] p-3 sm:p-6">
      <div className="w-full max-w-md">
        <TabletFrame>
          <DriverApp />
        </TabletFrame>
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-h-full flex-col overflow-hidden rounded-[2rem] border-[10px] border-slate-800 bg-slate-800 shadow-2xl ring-1 ring-black/50">
      <div className="flex shrink-0 items-center justify-center gap-2 bg-slate-800 py-1.5">
        <span className="h-1.5 w-10 rounded-full bg-slate-600" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[1.2rem] bg-rig-bg">
        {children}
      </div>
    </div>
  );
}

/**
 * Split-screen: tablet (40%) left, dashboard (60%) right on wide screens.
 * The left pane is collapsible so the office table can use the full width.
 * Below `lg` it stacks vertically; each pane gets its own capped height so
 * content scrolls independently instead of overflowing the shell.
 */
function SplitStage() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // Collapsed state on wide screens: show a thin re-open rail instead of the tablet.
  if (leftCollapsed) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
        {/* Re-open rail */}
        <button
          onClick={() => setLeftCollapsed(false)}
          title="Show Driver Field Tablet"
          className="group flex shrink-0 items-center justify-between gap-2 border-b border-rig-border bg-rig-panel/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:bg-rig-card lg:w-10 lg:flex-col lg:justify-start lg:border-b-0 lg:border-r lg:px-0 lg:py-3"
        >
          <span className="flex items-center gap-1.5 lg:[writing-mode:vertical-rl] lg:rotate-180">
            <PanelLeftOpen size={16} className="lg:rotate-90" /> 📱 Driver Tablet
          </span>
        </button>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-rig-border bg-rig-panel/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-400">
            🖥️ Back-Office Dashboard — Full Width
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            <OfficePortal />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row">
      <div className="flex min-h-0 min-w-0 basis-1/2 flex-col overflow-hidden border-b border-rig-border bg-[radial-gradient(ellipse_at_top,#132037,#0b1120)] lg:basis-2/5 lg:border-b-0 lg:border-r">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-rig-border bg-rig-panel/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-400">
          <span className="flex items-center gap-2">📱 Driver Field Tablet</span>
          <button
            onClick={() => setLeftCollapsed(true)}
            title="Collapse tablet · expand table"
            className="flex items-center gap-1 rounded-md border border-rig-border bg-rig-bg px-2 py-1 text-[10px] text-slate-300 hover:bg-rig-card"
          >
            <PanelLeftClose size={14} /> Collapse
          </button>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <DriverApp compact />
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 basis-1/2 flex-col overflow-hidden lg:basis-3/5">
        <div className="flex shrink-0 items-center gap-2 border-b border-rig-border bg-rig-panel/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-400">
          🖥️ Back-Office Dashboard
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <OfficePortal compact />
        </div>
      </div>
    </div>
  );
}
