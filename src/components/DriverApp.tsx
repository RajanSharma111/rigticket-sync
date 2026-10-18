// ============================================================================
// MODULE A + B: Driver Offline Field Ticket PWA (3-step flow) + Outbox tab.
// ============================================================================
import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Inbox,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Signal,
  SignalZero,
  Shield,
} from 'lucide-react';
import type { DriverTab, FieldTicket, JobType } from '../types';
import { useStore } from '../store';
import { Field, Select, TextInput, StatusBadge } from './ui';
import SignaturePad from './SignaturePad';
import { makeGpsStamp, emptyTicket, sampleOfflineTicket } from '../lib/ticketFactory';
import { makeGaugePhoto } from '../lib/gaugePhoto';
import { evaluateRules, allRulesSatisfied, codeLabel } from '../lib/validation';
import { computeBreakdown, money } from '../lib/pricing';
import { fmtTimeAgo } from '../lib/format';

const JOB_SEGMENTS: { key: JobType; label: string }[] = [
  { key: 'Produced Water Haul', label: 'Produced Water' },
  { key: 'Fresh Water Haul', label: 'Fresh Water' },
  { key: 'Flowback / Pit Cleaning', label: 'Vacuum / Pit Clean' },
  { key: 'Roustabout Crew Labor', label: 'Roustabout Labor' },
];

const STANDBY_REASONS = [
  'Waiting on SWD Line',
  'Locked Lease Gate',
  'Waiting on Company Man',
  'High H2S Shut-In',
];

const isFluid = (j: JobType) => j === 'Produced Water Haul' || j === 'Fresh Water Haul';

export default function DriverApp({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<DriverTab>('new');
  return (
    <div className="@container flex h-full flex-col bg-rig-bg">
      {/* Rugged device status strip */}
      <DeviceStrip />
      {/* Tabs */}
      <div className="flex border-b border-rig-border bg-rig-panel">
        <TabBtn active={tab === 'new'} onClick={() => setTab('new')} icon={<ClipboardList size={18} />} label="New Field Ticket" />
        <TabBtn active={tab === 'outbox'} onClick={() => setTab('outbox')} icon={<Inbox size={18} />} label="Device Outbox" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'new' ? <NewTicketFlow compact={compact} /> : <Outbox />}
      </div>
    </div>
  );
}

function DeviceStrip() {
  const { network } = useStore();
  const offline = network === 'offline';
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  );
  useEffect(() => {
    const id = setInterval(
      () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })),
      30_000,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className={`flex items-center justify-between px-4 py-1.5 font-mono text-[11px] ${
        offline ? 'bg-red-950/60 text-red-300' : 'bg-emerald-950/50 text-emerald-300'
      }`}
    >
      <span className="flex items-center gap-1.5">
        {offline ? <SignalZero size={13} /> : <Signal size={13} />}
        {offline ? 'NO SERVICE · 0 Bars' : 'Verizon LTE · 4 Bars'}
      </span>
      <span>RUGGED TABLET · Unit Cab Mount</span>
      <span>{clock}</span>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
        active ? 'border-b-2 border-amber-500 text-amber-400' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// NEW TICKET 3-STEP FLOW
// ---------------------------------------------------------------------------
function NewTicketFlow({ compact }: { compact: boolean }) {
  const store = useStore();
  const [ticket, setTicket] = useState<FieldTicket>(() => emptyTicket());
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<null | 'offline' | 'online'>(null);

  const operator = store.getOperator(ticket.operatorId);
  const operatorLeases = store.leases.filter((l) => l.operatorId === ticket.operatorId);
  const rules = evaluateRules(ticket, operator);
  const rulesOk = allRulesSatisfied(ticket, operator);
  const lease = store.leases.find((l) => l.id === ticket.leaseId) ?? null;
  const breakdown = computeBreakdown(ticket, operator);

  const set = (patch: Partial<FieldTicket>) => setTicket((t) => ({ ...t, ...patch }));

  function quickFill() {
    const t = sampleOfflineTicket();
    // attach gauge photo + signature + gps right away
    t.gaugePhoto = t.tank ? makeGaugePhoto({ tankNo: t.tank.tankNo, topGauge: t.tank.topGauge, bottomGauge: t.tank.bottomGauge, bbls: t.totalBbls }) : null;
    const demoSig =
      'data:image/svg+xml;base64,' +
      btoa(
        `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='100'><rect width='300' height='100' fill='white'/><path d='M20 70 C 40 20, 60 90, 90 50 S 140 10, 170 60 S 230 90, 280 40' stroke='#1e3a8a' stroke-width='3' fill='none' stroke-linecap='round'/></svg>`,
      );
    t.signature = demoSig;
    t.gps = makeGpsStamp(store.leases.find((l) => l.id === t.leaseId) ?? null);
    setTicket(t);
    setStep(3);
  }

  function loadSampleOffline() {
    const t = sampleOfflineTicket();
    setTicket(t);
    setStep(1);
    store.pushToast({ kind: 'info', title: 'Sample ticket loaded', message: `${t.ticketNo} pre-filled — ready to walk through 3 steps.` });
  }

  function resetFlow() {
    setTicket(emptyTicket());
    setStep(1);
    setSubmitted(null);
  }

  function submit() {
    // ensure gps stamp exists
    const gps = ticket.gps ?? makeGpsStamp(lease);
    const offline = store.network === 'offline';
    const finalTicket: FieldTicket = {
      ...ticket,
      gps,
      status: offline ? 'Queued on Device (Offline)' : 'Synced - Ready to Bill',
    };
    store.addTicket(finalTicket);
    setSubmitted(offline ? 'offline' : 'online');
    if (!offline) {
      store.pushToast({
        kind: 'sync',
        title: 'Ticket synced to office',
        message: `${finalTicket.ticketNo} — now Ready to Bill`,
      });
    }
  }

  if (submitted) {
    return <SubmittedScreen mode={submitted} ticket={ticket} onNew={resetFlow} />;
  }

  const canStep1 = !!ticket.leaseId && rulesOk;
  const padClass = compact ? 'p-3' : 'p-4 sm:p-5';

  return (
    <div className={padClass}>
      {/* Quick-fill helpers */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={quickFill}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
        >
          <Zap size={14} /> ⚡ Quick-Fill Demo Ticket & Signature
        </button>
        <button
          onClick={loadSampleOffline}
          className="rounded-lg border border-rig-border bg-rig-panel px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rig-card"
        >
          Load Sample Offline Ticket
        </button>
      </div>

      {/* Ticket id header */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-rig-border bg-rig-panel px-4 py-3">
        <div>
          <div className="font-mono text-lg font-bold text-amber-400">{ticket.ticketNo}</div>
          <div className="font-mono text-[11px] text-slate-500">BOL Manifest: {ticket.bolNo}</div>
        </div>
        <StepDots step={step} />
      </div>

      {step === 1 && (
        <Step1
          ticket={ticket}
          set={set}
          operator={operator}
          leases={operatorLeases}
          rules={rules}
          lease={lease}
        />
      )}
      {step === 2 && <Step2 ticket={ticket} set={set} />}
      {step === 3 && <Step3 ticket={ticket} set={set} lease={lease} breakdown={breakdown} />}

      {/* Nav */}
      <div className="mt-5 flex items-center gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-xl border border-rig-border bg-rig-panel px-4 py-3 text-sm font-bold text-slate-300 hover:bg-rig-card"
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !canStep1}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-900 shadow transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ChevronRight size={18} />
          </button>
        )}
        {step === 3 && (
          <SubmitButton ticket={ticket} onSubmit={submit} />
        )}
      </div>
      {step === 1 && !canStep1 && (
        <p className="mt-2 text-center text-[11px] text-amber-400/80">
          Select a Lease / Well and satisfy the Operator billing guardrail to continue.
        </p>
      )}
      {step === 3 && !(!!ticket.signature && !!ticket.companyManName.trim()) && (
        <p className="mt-2 text-center text-[11px] text-amber-400/80">
          To submit, enter the <strong>Company Man Name</strong>
          {!ticket.companyManName.trim() && <span className="text-red-400"> (missing)</span>} and capture a{' '}
          <strong>Signature</strong>
          {!ticket.signature && <span className="text-red-400"> (missing)</span>} — tap “Auto-Sign Demo Signature” for a quick demo.
        </p>
      )}
    </div>
  );
}

function SubmitButton({ ticket, onSubmit }: { ticket: FieldTicket; onSubmit: () => void }) {
  const { network } = useStore();
  const ready = !!ticket.signature && !!ticket.companyManName.trim();
  const offline = network === 'offline';
  return (
    <button
      onClick={onSubmit}
      disabled={!ready}
      className={`ml-auto flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold shadow transition disabled:cursor-not-allowed disabled:opacity-40 ${
        offline ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
      }`}
    >
      <CheckCircle2 size={18} />
      {offline ? 'Save to Device Vault' : 'Sign & Sync to Office'}
    </button>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-1.5">
          <div
            className={`grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold ${
              n === step
                ? 'bg-amber-500 text-slate-900'
                : n < step
                  ? 'bg-emerald-500/80 text-slate-900'
                  : 'bg-rig-card text-slate-500'
            }`}
          >
            {n}
          </div>
          {n < 3 && <div className={`h-0.5 w-5 ${n < step ? 'bg-emerald-500/60' : 'bg-rig-border'}`} />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 1 — Header / Well Site / Billing
// ---------------------------------------------------------------------------
function Step1({ ticket, set, operator, leases, rules, lease }: any) {
  const store = useStore();
  const guardrailOperator = operator.requiredCodes.length > 0;
  return (
    <div className="space-y-4">
      <SectionTitle n="1" title="Ticket Header, Well Site & Billing Validation" />

      <div className="grid grid-cols-1 gap-3 @2xl:grid-cols-3">
        <Field label="Driver / Pusher">
          <Select value={ticket.driverName} onChange={(e) => set({ driverName: e.target.value })}>
            {store.equipment.drivers.map((d: string) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Unit / Truck #">
          <Select value={ticket.truckNo} onChange={(e) => set({ truckNo: e.target.value })}>
            {store.equipment.trucks.map((d: string) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Trailer #">
          <Select value={ticket.trailerNo} onChange={(e) => set({ trailerNo: e.target.value })}>
            {store.equipment.trailers.map((d: string) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Operator (Customer)">
        <Select
          value={ticket.operatorId}
          onChange={(e) => set({ operatorId: e.target.value, leaseId: null })}
        >
          {store.operators.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
      </Field>

      {/* Smart billing guardrail */}
      {guardrailOperator && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
          <div className="flex items-start gap-2 text-amber-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="text-xs font-semibold leading-relaxed">
              ⚠️ Operator Rule: {operator.name} requires a valid{' '}
              {operator.requiredCodes.map((c: any) => codeLabel(c)).join(' + ')} before ticket sign-off to prevent invoice rejection.
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 @xl:grid-cols-3">
            {operator.requiredCodes.includes('AFE') && (
              <BillingInput
                label="AFE #"
                value={ticket.afeNumber}
                onChange={(v: string) => set({ afeNumber: v })}
                placeholder="AFE-4821"
                ok={rules.find((r: any) => r.code === 'AFE')?.satisfied}
              />
            )}
            {operator.requiredCodes.includes('PO') && (
              <BillingInput
                label="PO # / Work Order #"
                value={ticket.poNumber}
                onChange={(v: string) => set({ poNumber: v })}
                placeholder="PO-99120"
                ok={rules.find((r: any) => r.code === 'PO')?.satisfied}
              />
            )}
            {operator.requiredCodes.includes('CostCode') && (
              <BillingInput
                label="Cost Code / LOE"
                value={ticket.costCode}
                onChange={(v: string) => set({ costCode: v })}
                placeholder="LOE-8410"
                ok={rules.find((r: any) => r.code === 'CostCode')?.satisfied}
              />
            )}
          </div>
        </div>
      )}

      <Field label="Origin Lease / Well Name" required>
        <Select value={ticket.leaseId ?? ''} onChange={(e) => set({ leaseId: e.target.value || null })}>
          <option value="">— Select Well —</option>
          {leases.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </Select>
      </Field>

      {lease && (
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-rig-border bg-rig-panel p-3 font-mono text-xs text-slate-300 @lg:grid-cols-3">
          <div><span className="text-slate-500">API #</span><br />{lease.apiNumber}</div>
          <div><span className="text-slate-500">County / State</span><br />{lease.county}, {lease.state}</div>
          <div className="flex items-center gap-1"><MapPin size={12} className="text-amber-400" /> {lease.gps}</div>
        </div>
      )}

      <Field label="Destination SWD / Disposal Site">
        <Select value={ticket.swdId ?? ''} onChange={(e) => set({ swdId: e.target.value || null })}>
          <option value="">— Select Disposal —</option>
          {store.swdSites.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.location})</option>)}
        </Select>
      </Field>

      {/* Job type segmented */}
      <Field label="Job Type">
        <div className="grid grid-cols-2 gap-2 @sm:grid-cols-4">
          {JOB_SEGMENTS.map((j) => (
            <button
              key={j.key}
              type="button"
              onClick={() => set({ jobType: j.key })}
              className={`rounded-lg border px-2 py-3 text-xs font-bold transition ${
                ticket.jobType === j.key
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : 'border-rig-border bg-rig-panel text-slate-400 hover:text-slate-200'
              }`}
            >
              {j.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function BillingInput({ label, value, onChange, placeholder, ok }: any) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-amber-200/90">
        {label}
        {ok ? (
          <span className="flex items-center gap-0.5 text-emerald-400"><CheckCircle2 size={12} /> Verified</span>
        ) : (
          <span className="text-red-400">Required</span>
        )}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-rig-bg px-3 py-2.5 font-mono text-sm text-slate-100 outline-none transition ${
          ok ? 'border-emerald-500/50' : 'border-amber-500/40 focus:border-amber-500'
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 2 — Gauges / Time / Standby / Photo
// ---------------------------------------------------------------------------
function Step2({ ticket, set }: any) {
  const fluid = isFluid(ticket.jobType);
  const tank = ticket.tank ?? { tankNo: '', topGauge: '', bottomGauge: '', bswPct: 0, netBbls: 0 };
  const setTank = (patch: any) => set({ tank: { ...tank, ...patch } });

  function capturePhoto() {
    const url = makeGaugePhoto({
      tankNo: tank.tankNo || 'Tank #3 - 500 BBL Upright',
      topGauge: tank.topGauge || "12' 04\"",
      bottomGauge: tank.bottomGauge || "08' 10\"",
      bbls: ticket.totalBbls || 130,
    });
    set({ gaugePhoto: url });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ gaugePhoto: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <SectionTitle n="2" title="Load Gauges, Time, Standby & Photo Capture" />

      {fluid ? (
        <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Tank Strap / Gauge Readings</div>
          <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @2xl:grid-cols-4">
            <Field label="Tank #">
              <TextInput value={tank.tankNo} onChange={(e) => setTank({ tankNo: e.target.value })} placeholder="Tank #3" />
            </Field>
            <Field label="Top Gauge (ft/in)">
              <TextInput className="font-mono" value={tank.topGauge} onChange={(e) => setTank({ topGauge: e.target.value })} placeholder={`12' 04"`} />
            </Field>
            <Field label="Bottom Gauge (ft/in)">
              <TextInput className="font-mono" value={tank.bottomGauge} onChange={(e) => setTank({ bottomGauge: e.target.value })} placeholder={`08' 10"`} />
            </Field>
            <Field label="BS&W %">
              <TextInput type="number" step="0.1" className="font-mono" value={tank.bswPct} onChange={(e) => setTank({ bswPct: Number(e.target.value) })} />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Total Barrels (BBLs) Loaded">
              <TextInput
                type="number"
                className="font-mono text-lg"
                value={ticket.totalBbls}
                onChange={(e) => set({ totalBbls: Number(e.target.value), tank: { ...tank, netBbls: Number(e.target.value) } })}
              />
            </Field>
            <div className="mt-2 flex flex-wrap gap-2">
              {[110, 120, 130, 135].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => set({ totalBbls: b, tank: { ...tank, netBbls: b } })}
                  className={`rounded-lg border px-4 py-2 font-mono text-sm font-bold transition ${
                    ticket.totalBbls === b
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                      : 'border-rig-border bg-rig-bg text-slate-300 hover:bg-rig-card'
                  }`}
                >
                  {b} BBL
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
          <Field label="Billable Labor / Vacuum Hours" hint="Hourly job — no tank strap required.">
            <TextInput
              type="number"
              step="0.5"
              className="font-mono text-lg"
              value={ticket.roustaboutHrs}
              onChange={(e) => set({ roustaboutHrs: Number(e.target.value) })}
            />
          </Field>
        </div>
      )}

      {/* Time tracker */}
      <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Time & Demurrage / Standby Tracker</div>
        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @2xl:grid-cols-4">
          <Field label="Time Arrived Lease"><TextInput type="time" className="font-mono" value={ticket.timeArrivedLease} onChange={(e) => set({ timeArrivedLease: e.target.value })} /></Field>
          <Field label="Time Loaded"><TextInput type="time" className="font-mono" value={ticket.timeLoaded === '—' ? '' : ticket.timeLoaded} onChange={(e) => set({ timeLoaded: e.target.value })} /></Field>
          <Field label="Time Arrived SWD"><TextInput type="time" className="font-mono" value={ticket.timeArrivedSwd === '—' ? '' : ticket.timeArrivedSwd} onChange={(e) => set({ timeArrivedSwd: e.target.value })} /></Field>
          <Field label="Time Unloaded"><TextInput type="time" className="font-mono" value={ticket.timeUnloaded === '—' ? '' : ticket.timeUnloaded} onChange={(e) => set({ timeUnloaded: e.target.value })} /></Field>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 @sm:grid-cols-2">
          <Field label="Billable Standby / Demurrage Hours" hint="1st hr free, then $95–$115/hr.">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => set({ standbyHrs: Math.max(0, ticket.standbyHrs - 0.5) })} className="h-11 w-11 rounded-lg border border-rig-border bg-rig-bg text-xl font-bold text-slate-300 hover:bg-rig-card">−</button>
              <div className="flex-1 rounded-lg border border-rig-border bg-rig-bg py-2.5 text-center font-mono text-lg font-bold text-amber-400">{ticket.standbyHrs.toFixed(1)} hrs</div>
              <button type="button" onClick={() => set({ standbyHrs: Math.min(8, ticket.standbyHrs + 0.5) })} className="h-11 w-11 rounded-lg border border-rig-border bg-rig-bg text-xl font-bold text-slate-300 hover:bg-rig-card">+</button>
            </div>
          </Field>
          <Field label="Standby Reason">
            <Select value={ticket.standbyReason} onChange={(e) => set({ standbyReason: e.target.value })}>
              <option value="">— Select Reason —</option>
              {STANDBY_REASONS.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </div>

      {/* Hazard JSA */}
      <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          <Shield size={13} className="text-emerald-400" /> Field Notes / Hazard JSA Check
        </div>
        <div className="grid grid-cols-1 gap-2 @sm:grid-cols-3">
          <Check label="JSA Completed" checked={ticket.hazard.jsaCompleted} onChange={(v) => set({ hazard: { ...ticket.hazard, jsaCompleted: v } })} />
          <Check label="H2S Monitor Worn" checked={ticket.hazard.h2sMonitorWorn} onChange={(v) => set({ hazard: { ...ticket.hazard, h2sMonitorWorn: v } })} />
          <Check label="Chocks & Grounding Set" checked={ticket.hazard.wheelChocksGroundingSet} onChange={(v) => set({ hazard: { ...ticket.hazard, wheelChocksGroundingSet: v } })} />
        </div>
        <div className="mt-3">
          <Field label="Remarks">
            <textarea
              value={ticket.notes}
              onChange={(e) => set({ notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-rig-border bg-rig-bg px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-500/60"
            />
          </Field>
        </div>
      </div>

      {/* Photo */}
      <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Tank Gauge / Meter Photo</div>
        {ticket.gaugePhoto ? (
          <div className="relative">
            <img src={ticket.gaugePhoto} alt="Tank gauge readout" className="w-full rounded-lg border border-rig-border" />
            <button type="button" onClick={() => set({ gaugePhoto: null })} className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-white">Remove</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={capturePhoto} className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 hover:bg-amber-500/20">
              <Camera size={16} /> 📷 Simulate Tank Gauge Photo
            </button>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-rig-border bg-rig-bg px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-rig-card">
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
        checked ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-rig-border bg-rig-bg text-slate-400'
      }`}
    >
      <span className={`grid h-5 w-5 place-items-center rounded border ${checked ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-500'}`}>
        {checked && <CheckCircle2 size={14} />}
      </span>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// STEP 3 — Sign on Glass + GPS stamp
// ---------------------------------------------------------------------------
function Step3({ ticket, set, lease, breakdown }: any) {
  // Stamp GPS once when the step mounts (if not already stamped).
  useEffect(() => {
    if (!ticket.gps) set({ gps: makeGpsStamp(lease) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const gps = ticket.gps ?? makeGpsStamp(lease);

  return (
    <div className="space-y-4">
      <SectionTitle n="3" title="Sign on Glass — Company Man Sign-Off & GPS Proof" />

      <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
        <Field label="Company Man Name" required>
          <TextInput value={ticket.companyManName} onChange={(e) => set({ companyManName: e.target.value })} placeholder="Cody Jenkins" />
        </Field>
        <Field label="Company Man Phone / Radio Ch">
          <TextInput value={ticket.companyManPhone} onChange={(e) => set({ companyManPhone: e.target.value })} placeholder="Radio Ch 4 / (432) 555-0188" />
        </Field>
      </div>

      <Field label="Interactive Touch Signature — draw with finger or mouse" required>
        <SignaturePad value={ticket.signature} onChange={(v) => set({ signature: v })} />
      </Field>

      {/* GPS stamp */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-300">
          <MapPin size={13} /> Automatic Tamper-Proof GPS & Time Stamp
        </div>
        <div className="grid grid-cols-1 gap-2 font-mono text-xs text-slate-300 @sm:grid-cols-2">
          <div><span className="text-slate-500">Coordinates:</span> {gps.coordinates}</div>
          <div><span className="text-slate-500">Location:</span> {gps.county} · Accuracy {gps.accuracy}</div>
          <div><span className="text-slate-500">Timestamp:</span> {new Date(gps.timestamp).toLocaleString()}</div>
          <div className="truncate"><span className="text-slate-500">Device Hash:</span> {gps.deviceHash}</div>
        </div>
      </div>

      {/* Running total preview */}
      <div className="rounded-xl border border-rig-border bg-rig-panel p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Estimated Ticket Total</span>
          <span className="font-mono text-xl font-bold text-emerald-400">{money(breakdown.total)}</span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-slate-500">
          {breakdown.haulLabel}: {breakdown.haulQty} {breakdown.haulUnit} × {money(breakdown.haulRate)} + Standby {breakdown.standbyHrs}h + FSC {(breakdown.fuelSurchargePct * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 font-mono text-sm font-bold text-slate-900">{n}</span>
      <h3 className="text-sm font-bold text-slate-100">{title}</h3>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submitted confirmation screen
// ---------------------------------------------------------------------------
function SubmittedScreen({ mode, ticket, onNew }: { mode: 'offline' | 'online'; ticket: FieldTicket; onNew: () => void }) {
  const offline = mode === 'offline';
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
      <div className={`grid h-20 w-20 place-items-center rounded-full ${offline ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
        {offline ? <SignalZero size={40} /> : <CheckCircle2 size={40} />}
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-100">
        {offline ? 'Saved Locally to Device Vault' : 'Synced — Ready to Bill'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        {offline
          ? 'Will auto-sync when the truck reaches cell coverage. Flip the network toggle to 🟢 ONLINE to watch it sync to the back office.'
          : `${ticket.ticketNo} landed in the Back-Office Dashboard and is ready to push to QuickBooks.`}
      </p>
      <div className="mt-3 rounded-lg border border-rig-border bg-rig-panel px-4 py-2 font-mono text-sm text-amber-400">
        {ticket.ticketNo}
      </div>
      <button onClick={onNew} className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-amber-400">
        + Start New Field Ticket
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MODULE B — Device Outbox
// ---------------------------------------------------------------------------
function Outbox() {
  const { tickets, network } = useStore();
  const today = useMemo(() => tickets, [tickets]);
  const queued = today.filter((t) => t.status === 'Queued on Device (Offline)');

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">Local Device Outbox</h3>
        <span className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold ${queued.length ? 'bg-amber-500/15 text-amber-300' : 'bg-rig-card text-slate-500'}`}>
          {queued.length} payload{queued.length !== 1 ? 's' : ''} waiting for signal
        </span>
      </div>

      {network === 'offline' && queued.length > 0 && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs font-semibold text-red-300">
          🔴 In a dead zone — {queued.length} signed ticket{queued.length > 1 ? 's' : ''} held in the device vault. Toggle 🟢 ONLINE to flush the queue.
        </div>
      )}

      <div className="space-y-2">
        {today.length === 0 && <p className="text-sm text-slate-500">No tickets created on this device yet.</p>}
        {today.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-rig-border bg-rig-panel px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-amber-400">{t.ticketNo}</span>
                <span className="text-xs text-slate-500">{fmtTimeAgo(t.createdAt)}</span>
              </div>
              <div className="truncate text-xs text-slate-400">{t.driverName} · {t.jobType} · {t.totalBbls ? `${t.totalBbls} BBL` : `${t.roustaboutHrs} hr`}</div>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
