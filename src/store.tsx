// ============================================================================
// Global app store — tickets, connectivity, sync engine, toasts.
// ============================================================================
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { FieldTicket, NetworkStatus, Operator } from './types';
import { OPERATORS, LEASES, SWD_SITES, EQUIPMENT } from './seed';
import {
  loadTickets,
  saveTickets,
  loadNetwork,
  saveNetwork,
  nextQboInvoiceId,
  resetDemoData,
} from './lib/storage';

export interface Toast {
  id: string;
  kind: 'sync' | 'bill' | 'info' | 'warn';
  title: string;
  message: string;
}

export interface SyncProgress {
  active: boolean;
  label: string;
  pct: number;
}

interface StoreValue {
  tickets: FieldTicket[];
  network: NetworkStatus;
  operators: Operator[];
  leases: typeof LEASES;
  swdSites: typeof SWD_SITES;
  equipment: typeof EQUIPMENT;
  toasts: Toast[];
  syncProgress: SyncProgress;
  queuedCount: number;
  // actions
  addTicket: (t: FieldTicket) => void;
  updateTicket: (t: FieldTicket) => void;
  setNetwork: (s: NetworkStatus) => void;
  billTicket: (id: string) => Promise<string>;
  bulkBill: (ids: string[]) => Promise<void>;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  resetDemo: () => void;
  getOperator: (id: string) => Operator;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<FieldTicket[]>(() => loadTickets());
  const [network, setNetworkState] = useState<NetworkStatus>(() => loadNetwork());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    active: false,
    label: '',
    pct: 0,
  });
  const prevNetwork = useRef<NetworkStatus>(network);

  useEffect(() => saveTickets(tickets), [tickets]);
  useEffect(() => saveNetwork(network), [network]);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addTicket = useCallback((t: FieldTicket) => {
    setTickets((prev) => [t, ...prev]);
  }, []);

  const updateTicket = useCallback((t: FieldTicket) => {
    setTickets((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  }, []);

  const getOperator = useCallback(
    (id: string) => OPERATORS.find((o) => o.id === id) ?? OPERATORS[0],
    [],
  );

  // --- Sync engine: when flipping offline -> online, flush the device queue ---
  const runSync = useCallback(
    (queued: FieldTicket[]) => {
      const n = queued.length;
      setSyncProgress({
        active: true,
        label: `Syncing ${n} offline ticket${n > 1 ? 's' : ''} + GPS + signature + tank photo...`,
        pct: 6,
      });
      let pct = 6;
      const timer = setInterval(() => {
        pct += Math.random() * 22 + 8;
        if (pct >= 100) {
          pct = 100;
          clearInterval(timer);
          setSyncProgress({ active: true, label: 'Sync complete', pct: 100 });
          // promote queued tickets to synced
          setTickets((prev) =>
            prev.map((t) =>
              t.status === 'Queued on Device (Offline)'
                ? { ...t, status: 'Synced - Ready to Bill' }
                : t,
            ),
          );
          queued.forEach((t) =>
            pushToast({
              kind: 'sync',
              title: 'Ticket synced to office',
              message: `${t.ticketNo} • ${t.driverName} — now Ready to Bill`,
            }),
          );
          setTimeout(() => setSyncProgress({ active: false, label: '', pct: 0 }), 900);
        } else {
          setSyncProgress((sp) => ({ ...sp, pct }));
        }
      }, 320);
    },
    [pushToast],
  );

  const setNetwork = useCallback(
    (s: NetworkStatus) => {
      const was = prevNetwork.current;
      prevNetwork.current = s;
      setNetworkState(s);
      if (was === 'offline' && s === 'online') {
        const queued = tickets.filter((t) => t.status === 'Queued on Device (Offline)');
        if (queued.length > 0) runSync(queued);
      }
    },
    [tickets, runSync],
  );

  const billTicket = useCallback(
    async (id: string): Promise<string> => {
      const invId = nextQboInvoiceId();
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: 'Billed in QuickBooks', qboInvoiceId: invId } : t,
        ),
      );
      return invId;
    },
    [],
  );

  const bulkBill = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        const invId = nextQboInvoiceId();
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: 'Billed in QuickBooks', qboInvoiceId: invId } : t,
          ),
        );
        await new Promise((r) => setTimeout(r, 160));
      }
    },
    [],
  );

  const resetDemo = useCallback(() => {
    resetDemoData();
    setTickets(loadTickets());
    setNetworkState('online');
    prevNetwork.current = 'online';
    pushToast({ kind: 'info', title: 'Demo reset', message: 'Seed data restored. Ready for next walkthrough.' });
  }, [pushToast]);

  const queuedCount = useMemo(
    () => tickets.filter((t) => t.status === 'Queued on Device (Offline)').length,
    [tickets],
  );

  const value: StoreValue = {
    tickets,
    network,
    operators: OPERATORS,
    leases: LEASES,
    swdSites: SWD_SITES,
    equipment: EQUIPMENT,
    toasts,
    syncProgress,
    queuedCount,
    addTicket,
    updateTicket,
    setNetwork,
    billTicket,
    bulkBill,
    pushToast,
    dismissToast,
    resetDemo,
    getOperator,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
