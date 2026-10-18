// ============================================================================
// MODULE C: Back-Office Dispatch, Rate Sheet & QuickBooks Portal.
// ============================================================================
import { useMemo, useState } from 'react';
import {
  Gauge,
  Clock,
  ShieldCheck,
  DollarSign,
  FileText,
  Zap,
  CheckCircle2,
  MapPin,
  PenLine,
} from 'lucide-react';
import type { FieldTicket } from '../types';
import { useStore } from '../store';
import { Stat, StatusBadge } from './ui';
import { computeBreakdown, money } from '../lib/pricing';
import { allRulesSatisfied } from '../lib/validation';
import { fmtDate } from '../lib/format';
import CarbonTicketModal from './CarbonTicketModal';
import QuickBooksModal from './QuickBooksModal';

type StatusFilter = 'All' | 'Queued Offline' | 'Ready to Bill' | 'Pushed to QuickBooks';

export default function OfficePortal({ compact = false }: { compact?: boolean }) {
  const store = useStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [operatorFilter, setOperatorFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [pdfTicket, setPdfTicket] = useState<FieldTicket | null>(null);
  const [qbo, setQbo] = useState<{ tickets: FieldTicket[]; bulk: boolean } | null>(null);

  // Office only sees tickets that have left the device (not offline-queued)
  const visible = store.tickets.filter((t) => t.status !== 'Queued on Device (Offline)');

  const filtered = useMemo(() => {
    return visible.filter((t) => {
      const statusOk =
        statusFilter === 'All' ||
        (statusFilter === 'Ready to Bill' && t.status === 'Synced - Ready to Bill') ||
        (statusFilter === 'Pushed to QuickBooks' && t.status === 'Billed in QuickBooks') ||
        (statusFilter === 'Queued Offline' && t.status === 'Queued on Device (Offline)');
      const opOk = operatorFilter === 'All' || t.operatorId === operatorFilter;
      const jobOk = jobFilter === 'All' || t.jobType === jobFilter;
      return statusOk && opOk && jobOk;
    });
  }, [visible, statusFilter, operatorFilter, jobFilter]);

  // ---- KPIs ----
  const kpis = useMemo(() => {
    const ready = visible.filter((t) => t.status === 'Synced - Ready to Bill');
    const readyTotal = ready.reduce((s, t) => s + computeBreakdown(t, store.getOperator(t.operatorId)).total, 0);
    const standbyRev = visible
      .filter((t) => t.status !== 'Queued on Device (Offline)')
      .reduce((s, t) => s + computeBreakdown(t, store.getOperator(t.operatorId)).standbyCharge, 0);
    return { readyTotal, readyCount: ready.length, standbyRev };
  }, [visible, store]);

  const readyTickets = visible.filter((t) => t.status === 'Synced - Ready to Bill');

  return (
    <div className="@container h-full w-full overflow-y-auto bg-rig-bg">
      <div className={compact ? 'p-3' : 'p-4 sm:p-6'}>
        {/* Title */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Back-Office Dispatch & Billing Portal</h2>
            <p className="text-xs text-slate-500">Pecos Valley Vacuum & Roustabout LLC · QuickBooks Online connected</p>
          </div>
          {readyTickets.length > 0 && (
            <button
              onClick={() => setQbo({ tickets: readyTickets, bulk: true })}
              className="flex items-center gap-1.5 rounded-xl bg-[#2ca01c] px-4 py-2.5 text-sm font-extrabold text-white shadow hover:bg-[#248016]"
            >
              <Zap size={16} /> Bulk Push All Ready Tickets ({readyTickets.length})
            </button>
          )}
        </div>

        {/* KPI banner */}
        <div className="mb-5 grid grid-cols-4 gap-2 @3xl:gap-3">
          <Stat
            accent="amber"
            label="Unbilled Tickets Ready"
            value={money(kpis.readyTotal)}
            sub={<><Gauge size={11} className="mr-1 inline" />across {kpis.readyCount} tickets</>}
          />
          <Stat
            accent="sky"
            label="Avg Ticket-to-Invoice"
            value="4.2 Hrs"
            sub={<><Clock size={11} className="mr-1 inline" />vs. 18 Days on paper</>}
          />
          <Stat
            accent="emerald"
            label="Invoice Rejections Prevented"
            value="100%"
            sub={<><ShieldCheck size={11} className="mr-1 inline" />First-pass approval (AFE guardrail)</>}
          />
          <Stat
            accent="violet"
            label="Standby / Demurrage Captured"
            value={money(kpis.standbyRev)}
            sub={<><MapPin size={11} className="mr-1 inline" />verified by GPS stamps</>}
          />
        </div>

        {/* Rate sheet */}
        <RateSheetStrip />

        {/* Filters */}
        <div className="mb-3 mt-5 flex flex-wrap items-center gap-2">
          <FilterGroup
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={['All', 'Ready to Bill', 'Pushed to QuickBooks']}
          />
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="rounded-lg border border-rig-border bg-rig-panel px-3 py-2 text-xs font-semibold text-slate-300"
          >
            <option value="All">All Operators</option>
            {store.operators.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="rounded-lg border border-rig-border bg-rig-panel px-3 py-2 text-xs font-semibold text-slate-300"
          >
            <option value="All">All Job Types</option>
            {['Produced Water Haul', 'Fresh Water Haul', 'Flowback / Pit Cleaning', 'Roustabout Crew Labor', 'Hot-Shot Freight'].map((j) => <option key={j}>{j}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">{filtered.length} ticket(s)</span>
        </div>

        {/* Table */}
        <TicketTable
          tickets={filtered}
          onView={(t) => setPdfTicket(t)}
          onPush={(t) => setQbo({ tickets: [t], bulk: false })}
        />
      </div>

      <CarbonTicketModal ticket={pdfTicket} onClose={() => setPdfTicket(null)} />
      {qbo && <QuickBooksModal tickets={qbo.tickets} bulk={qbo.bulk} onClose={() => setQbo(null)} />}
    </div>
  );
}

function FilterGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-rig-border bg-rig-panel p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            value === o ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function RateSheetStrip() {
  const items = [
    { label: 'Produced Water Haul', val: '$2.35 / BBL' },
    { label: 'Fresh Water Haul', val: '$1.95 / BBL' },
    { label: 'Roustabout Crew', val: '$165.00 / hr' },
    { label: 'Vacuum / Pit Clean', val: '$125.00 / hr' },
    { label: 'Demurrage / Standby', val: '$95.00 / hr' },
    { label: 'Fuel Surcharge (FSC)', val: '8%' },
  ];
  return (
    <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
        <DollarSign size={13} className="text-emerald-400" /> Automated Rate Sheet & Pricing Engine
      </div>
      <div className="grid grid-cols-2 gap-2 @lg:grid-cols-3 @3xl:grid-cols-6">
        {items.map((i) => (
          <div key={i.label} className="rounded-lg border border-rig-border bg-rig-bg px-3 py-2">
            <div className="text-[10px] uppercase text-slate-500">{i.label}</div>
            <div className="font-mono text-sm font-bold text-emerald-400">{i.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketTable({
  tickets,
  onView,
  onPush,
}: {
  tickets: FieldTicket[];
  onView: (t: FieldTicket) => void;
  onPush: (t: FieldTicket) => void;
}) {
  const store = useStore();
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-rig-border bg-rig-panel p-10 text-center text-sm text-slate-500">
        No tickets match these filters. Create one in the Driver PWA (toggle 🟢 ONLINE to sync offline tickets).
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-rig-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-rig-panel text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <Th>Ticket # & Date</Th>
            <Th>Operator & Lease / Well</Th>
            <Th>Driver & Unit #</Th>
            <Th>Job & Volume</Th>
            <Th>Standby</Th>
            <Th>AFE # / PO #</Th>
            <Th>Total</Th>
            <Th>Proof</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const op = store.getOperator(t.operatorId);
            const lease = store.leases.find((l) => l.id === t.leaseId);
            const b = computeBreakdown(t, op);
            const verified = allRulesSatisfied(t, op);
            const billed = t.status === 'Billed in QuickBooks';
            return (
              <tr key={t.id} className="border-t border-rig-border odd:bg-rig-bg even:bg-rig-panel/40 hover:bg-rig-card/60">
                <Td>
                  <div className="font-mono font-bold text-amber-400">{t.ticketNo}</div>
                  <div className="text-[11px] text-slate-500">{fmtDate(t.createdAt)}</div>
                </Td>
                <Td>
                  <div className="font-semibold text-slate-200">{op.name}</div>
                  <div className="text-[11px] text-slate-500">{lease?.name ?? '—'}</div>
                </Td>
                <Td>
                  <div className="text-slate-300">{t.driverName}</div>
                  <div className="font-mono text-[11px] text-slate-500">{t.truckNo.split(' - ')[0]}</div>
                </Td>
                <Td>
                  <div className="text-slate-300">{t.jobType}</div>
                  <div className="font-mono text-[11px] text-slate-500">{t.totalBbls ? `${t.totalBbls} BBL` : `${t.roustaboutHrs} hr`}</div>
                </Td>
                <Td><span className="font-mono text-slate-300">{t.standbyHrs.toFixed(1)}h</span></Td>
                <Td>
                  <div className="flex items-center gap-1 font-mono text-[12px] text-slate-300">
                    {t.afeNumber || t.poNumber || t.costCode || '—'}
                    {verified && <CheckCircle2 size={13} className="text-emerald-400" />}
                  </div>
                </Td>
                <Td><span className="font-mono font-bold text-emerald-400">{money(b.total)}</span></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {t.gps && <MapPin size={14} className="text-emerald-400" aria-label="GPS stamped" />}
                    {t.signature && <PenLine size={14} className="text-sky-400" aria-label="Signed" />}
                  </div>
                </Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onView(t)}
                      className="flex items-center gap-1 rounded-lg border border-rig-border bg-rig-bg px-2 py-1.5 text-xs font-semibold text-slate-300 hover:bg-rig-card"
                      title="View carbon-copy PDF"
                    >
                      <FileText size={13} /> PDF
                    </button>
                    {billed ? (
                      <span className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1.5 font-mono text-[11px] font-bold text-emerald-300">
                        {t.qboInvoiceId}
                      </span>
                    ) : (
                      <button
                        onClick={() => onPush(t)}
                        className="flex items-center gap-1 rounded-lg bg-[#2ca01c] px-2 py-1.5 text-xs font-bold text-white hover:bg-[#248016]"
                        title="Push to QuickBooks"
                      >
                        <Zap size={13} /> Push
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2.5 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-3 py-2.5 align-top">{children}</td>;
}
