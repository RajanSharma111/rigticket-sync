// ============================================================================
// RigTicket Sync — Marketing landing page.
// All visuals are inline SVG / CSS (no external images → nothing can break).
// ============================================================================
import { useEffect, useRef, useState } from 'react';
import {
  Truck,
  WifiOff,
  PenLine,
  MapPin,
  ShieldCheck,
  Zap,
  FileText,
  Droplets,
  Gauge,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Fuel,
  Signal,
  TrendingUp,
  Mail,
  Copy,
  Check,
} from 'lucide-react';

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="min-h-screen bg-rig-bg text-slate-200">
      <OilfieldBackdrop />
      <div className="relative z-10">
        <NavBar onLaunch={onLaunch} />
        <Hero onLaunch={onLaunch} />
        <TrustBar />
        <ProblemSolution />
        <Metrics />
        <Comparison />
        <Features />
        <HowItWorks />
        <FinalCta onLaunch={onLaunch} />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Ambient oilfield backdrop — pumpjacks, sun, dunes (pure SVG, fixed).
 * ------------------------------------------------------------------------ */
function OilfieldBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#17263f_0%,#0b1120_55%)]" />
      {/* amber sun glow */}
      <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      {/* dunes + pumpjacks silhouette */}
      <svg className="absolute bottom-0 left-0 w-full opacity-[0.5]" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path fill="#0d1a2e" d="M0,220 C240,180 480,260 720,230 C960,200 1200,250 1440,210 L1440,320 L0,320 Z" />
        <path fill="#0a1526" d="M0,260 C300,230 520,300 820,270 C1080,245 1260,290 1440,260 L1440,320 L0,320 Z" />
      </svg>
      <div className="absolute bottom-6 left-[8%] opacity-30"><Pumpjack /></div>
      <div className="absolute bottom-10 right-[12%] scale-75 opacity-20"><Pumpjack /></div>
      <div className="absolute bottom-4 left-[42%] scale-50 opacity-15"><Pumpjack /></div>
    </div>
  );
}

function Pumpjack() {
  return (
    <svg width="160" height="110" viewBox="0 0 160 110" className="text-slate-700">
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <line x1="20" y1="100" x2="60" y2="100" />
        <line x1="40" y1="100" x2="40" y2="45" />
        <line x1="60" y1="100" x2="60" y2="45" />
        <line x1="30" y1="40" x2="120" y2="30" className="origin-[40px_45px] animate-[pump_4s_ease-in-out_infinite]" style={{ transformBox: 'fill-box' }} />
        <line x1="120" y1="30" x2="120" y2="70" />
        <circle cx="40" cy="45" r="5" fill="currentColor" />
      </g>
      <style>{`@keyframes pump{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}`}</style>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
function NavBar({ onLaunch }: { onLaunch: () => void }) {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20">
          <Truck size={22} />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-base font-extrabold tracking-tight text-amber-400">
            RigTicket<span className="text-slate-100"> Sync</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Oilfield Field Ticketing</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="#contact"
          className="hidden items-center gap-1.5 rounded-xl border border-rig-border bg-rig-bg px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-rig-card sm:flex"
        >
          <Mail size={15} /> Contact
        </a>
        <button
          onClick={onLaunch}
          className="group flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
        >
          Launch Live Demo
          <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <header className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-10 pt-6 lg:grid-cols-2 lg:pt-12">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <WifiOff size={13} /> Offline-First · Permian & Bakken Basin
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
          Kill the paper
          <br />
          field ticket.
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Get paid in hours.
          </span>
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-400">
          RigTicket Sync turns 3-part carbon-copy water-hauling & roustabout tickets into
          <span className="text-slate-200"> signed, GPS-stamped digital tickets</span> that sync from
          the dead zone and push straight to QuickBooks — recovering the
          <span className="text-emerald-400 font-semibold"> $100K+/year</span> small fleets lose to
          rejected invoices and missed standby.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            onClick={onLaunch}
            className="group flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-extrabold text-slate-900 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400"
          >
            <Zap size={18} /> Open the App
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 size={16} className="text-emerald-400" /> No login · Live demo data loaded
          </div>
        </div>
        {/* mini proof chips */}
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-emerald-400" /> GPS proof stamp</span>
          <span className="flex items-center gap-1.5"><PenLine size={13} className="text-sky-400" /> Sign on glass</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-amber-400" /> AFE guardrail</span>
          <span className="flex items-center gap-1.5"><FileText size={13} className="text-slate-300" /> 1-click QuickBooks</span>
        </div>
      </div>

      {/* Hero visual: floating ticket card */}
      <div className="relative">
        <TicketMockup />
      </div>
    </header>
  );
}

/* A stylized field-ticket card used as the hero graphic. */
function TicketMockup() {
  return (
    <div className="relative mx-auto max-w-sm">
      {/* glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-sky-500/20 blur-2xl" />
      <div className="relative animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-rig-border bg-rig-card p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-lg font-bold text-amber-400">FT-2026-0849</div>
            <div className="font-mono text-[10px] text-slate-500">BOL-884413 · Mustang State #4H</div>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">
            🟢 Billed
          </span>
        </div>

        {/* fluid gauge */}
        <div className="mt-4 flex items-end gap-3">
          <div className="relative h-24 w-14 overflow-hidden rounded-md border border-rig-border bg-rig-bg">
            <div className="absolute bottom-0 left-0 right-0 h-[62%] bg-gradient-to-t from-sky-600/70 to-sky-400/50">
              <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-sky-300/60" />
            </div>
            <Droplets size={16} className="absolute left-1/2 top-2 -translate-x-1/2 text-sky-300" />
          </div>
          <div className="flex-1">
            <Row icon={<Gauge size={13} className="text-amber-400" />} k="Net Volume" v="130 BBL" />
            <Row icon={<Clock size={13} className="text-violet-400" />} k="Standby" v="1.5 hr" />
            <Row icon={<MapPin size={13} className="text-emerald-400" />} k="GPS" v="31.42°N ±4m" />
            <Row icon={<DollarSign size={13} className="text-emerald-400" />} k="Total" v="$305.50" />
          </div>
        </div>

        {/* signature line */}
        <div className="mt-4 rounded-lg border border-rig-border bg-white p-2">
          <svg viewBox="0 0 300 48" className="h-10 w-full">
            <path
              d="M12 34 C 40 6, 60 46, 92 26 S 150 4, 182 30 S 250 46, 290 18"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="mt-1 text-center font-mono text-[9px] text-slate-400">
            Company Man · Cody Jenkins · signed on glass
          </div>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}

function Row({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-rig-border/60 py-1 text-xs last:border-0">
      <span className="flex items-center gap-1.5 text-slate-400">{icon}{k}</span>
      <span className="font-mono font-bold text-slate-100">{v}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function TrustBar() {
  const ops = ['Permian Resources', 'Mewbourne Oil', 'Devon Energy', 'Diamondback Energy'];
  return (
    <section className="border-y border-rig-border/60 bg-rig-panel/40 py-5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5">
        <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Built for tickets billed to
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-sm font-semibold text-slate-400">
          {ops.map((o) => (
            <span key={o} className="opacity-80">{o}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function ProblemSolution() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-50">
        Paper tickets bleed money. We stop the leak.
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
        A vacuum truck pulls produced saltwater from the lease and hauls it to a disposal well.
        Every step of that job has to be documented to get paid — and paper fails at every step.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <ProblemCard
          icon={<ShieldCheck />}
          title="Invoices rejected 60 days"
          problem="Missing AFE# / PO# gets the invoice bounced for two months."
          fix="Smart guardrail blocks sign-off until billing codes are valid."
        />
        <ProblemCard
          icon={<Clock />}
          title="18 days to bill"
          problem="Paper rides in the truck for days, then gets hand-keyed."
          fix="Signed tickets sync instantly and push to QuickBooks in ~4 hrs."
        />
        <ProblemCard
          icon={<MapPin />}
          title="Standby never captured"
          problem="Hours waiting in the SWD line get forgotten or disputed."
          fix="GPS + timestamp proof makes every billable minute undeniable."
        />
      </div>
    </section>
  );
}

function ProblemCard({ icon, title, problem, fix }: { icon: React.ReactNode; title: string; problem: string; fix: string }) {
  return (
    <div className="rounded-2xl border border-rig-border bg-rig-card/70 p-5 backdrop-blur">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-400">{icon}</div>
      <h3 className="mt-4 font-bold text-slate-100">{title}</h3>
      <p className="mt-2 flex gap-2 text-sm text-slate-400"><span className="text-red-400">✗</span> {problem}</p>
      <p className="mt-2 flex gap-2 text-sm text-slate-300"><span className="text-emerald-400">✓</span> {fix}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function Metrics() {
  return (
    <section className="border-y border-rig-border/60 bg-rig-panel/40 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 lg:grid-cols-4">
        <Counter to={4820} prefix="$" label="Unbilled tickets cleared / day" accent="amber" />
        <Counter to={4.2} suffix=" hrs" decimals={1} label="Avg ticket → invoice" accent="sky" sub="vs. 18 days on paper" />
        <Counter to={100} suffix="%" label="First-pass invoice approval" accent="emerald" />
        <Counter to={1425} prefix="$" label="Standby captured / week" accent="violet" sub="verified by GPS" />
      </div>
    </section>
  );
}

function Counter({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  label,
  sub,
  accent,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  sub?: string;
  accent: 'amber' | 'sky' | 'emerald' | 'violet';
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const color = {
    amber: 'text-amber-400',
    sky: 'text-sky-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
  }[accent];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const dur = 1200;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  const shown =
    prefix +
    val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
    suffix;

  return (
    <div ref={ref} className="text-center">
      <div className={`font-mono text-3xl font-extrabold sm:text-4xl ${color}`}>{shown}</div>
      <div className="mt-1.5 text-sm font-semibold text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paper vs RigTicket — animated cash-flow line chart + verdict panels.        */
function Comparison() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setShow(true), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-5xl px-5 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <TrendingUp size={13} /> The money difference
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-50">Paper vs. RigTicket</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Same 30 field tickets. One fleet bills on paper, the other on RigTicket. Watch when the cash actually lands.
        </p>
      </div>

      {/* Chart card */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-rig-border bg-rig-card/60 p-5 backdrop-blur sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-300">Cumulative cash collected</div>
          <div className="flex items-center gap-4 text-xs">
            <Legend color="#f87171" label="Paper tickets" />
            <Legend color="#34d399" label="RigTicket Sync" />
          </div>
        </div>
        <CashFlowChart show={show} />
      </div>

      {/* Verdict stat deltas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Delta big="14.8 days" small="faster to cash" note="4.2 hrs vs. 18 days" icon={<Clock />} />
        <Delta big="40% → 0%" small="invoice rejections" note="AFE guardrail" icon={<ShieldCheck />} />
        <Delta big="+$1,425/wk" small="standby recovered" note="GPS-verified" icon={<MapPin />} />
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-400">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}

/* Smooth animated SVG line chart (stroke-dash reveal, no deps). */
function CashFlowChart({ show }: { show: boolean }) {
  // 0..30 days, cumulative collected (out of $48k billed).
  // Paper: flat until ~day 18, then jumps. RigTicket: climbs almost immediately.
  const W = 760;
  const H = 260;
  const pad = { l: 46, r: 72, t: 18, b: 28 };
  const maxY = 50; // $k
  const days = 30;
  const x = (d: number) => pad.l + (d / days) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxY) * (H - pad.t - pad.b);

  const paperPts = Array.from({ length: days + 1 }, (_, d) => {
    const v = d < 17 ? d * 0.15 : Math.min(48, 2.5 + (d - 17) * 3.4);
    return [x(d), y(v)] as const;
  });
  const rigPts = Array.from({ length: days + 1 }, (_, d) => {
    const v = Math.min(48, 48 * (1 - Math.exp(-d / 3.2)));
    return [x(d), y(v)] as const;
  });

  const toPath = (pts: readonly (readonly [number, number])[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const toArea = (pts: readonly (readonly [number, number])[]) =>
    `${toPath(pts)} L${x(days)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }}>
      <defs>
        <linearGradient id="rigFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.28" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 12.5, 25, 37.5, 50].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#24344f" strokeWidth="1" strokeDasharray="3 5" />
          <text x={pad.l - 8} y={y(v) + 3} textAnchor="end" className="fill-slate-500" fontSize="10" fontFamily="monospace">
            ${v}k
          </text>
        </g>
      ))}
      {/* rigticket area + line */}
      <path d={toArea(rigPts)} fill="url(#rigFill)" opacity={show ? 1 : 0} style={{ transition: 'opacity .8s .5s' }} />
      <path
        d={toPath(rigPts)}
        fill="none"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2000"
        strokeDashoffset={show ? 0 : 2000}
        style={{ transition: 'stroke-dashoffset 1.6s ease-out' }}
      />
      {/* paper line */}
      <path
        d={toPath(paperPts)}
        fill="none"
        stroke="#f87171"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2000"
        strokeDashoffset={show ? 0 : 2000}
        style={{ transition: 'stroke-dashoffset 1.6s ease-out .3s' }}
      />
      {/* end dots + labels */}
      <circle cx={x(days)} cy={y(48)} r="4.5" fill="#34d399" opacity={show ? 1 : 0} style={{ transition: 'opacity .4s 1.7s' }} />
      <text x={x(days) + 8} y={y(48) + 3} fontSize="11" fontWeight="700" fontFamily="monospace" className="fill-emerald-300" opacity={show ? 1 : 0} style={{ transition: 'opacity .4s 1.8s' }}>
        $48k
      </text>
      {/* "paid in hours" marker on rig curve near day 1 */}
      <g opacity={show ? 1 : 0} style={{ transition: 'opacity .4s 1.9s' }}>
        <circle cx={x(2)} cy={y(22)} r="3.5" fill="#34d399" />
        <text x={x(2) + 8} y={y(22) - 6} fontSize="10" fontFamily="monospace" className="fill-emerald-300">
          paid in ~4 hrs
        </text>
      </g>
      {/* paper "18 days" annotation — sits ABOVE the flat red line, inside bounds */}
      <g opacity={show ? 1 : 0} style={{ transition: 'opacity .4s 2.2s' }}>
        <text x={x(4)} y={y(8)} fontSize="10" fontFamily="monospace" className="fill-red-300/80">
          Paper: 18 days stuck in the truck
        </text>
      </g>
      {/* x-axis day labels (inside SVG so they stay aligned) */}
      {[0, 10, 20, 30].map((d) => (
        <text
          key={d}
          x={x(d)}
          y={H - 8}
          textAnchor={d === 0 ? 'start' : d === 30 ? 'end' : 'middle'}
          fontSize="10"
          fontFamily="monospace"
          className="fill-slate-500"
        >
          Day {d}
        </text>
      ))}
    </svg>
  );
}

function Delta({ big, small, note, icon }: { big: string; small: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rig-border bg-rig-card/70 p-4 backdrop-blur">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">{icon}</div>
      <div>
        <div className="font-mono text-lg font-extrabold text-slate-50">{big}</div>
        <div className="text-xs font-semibold text-slate-300">{small}</div>
        <div className="text-[11px] text-slate-500">{note}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
function Features() {
  const items = [
    { icon: <WifiOff />, title: 'Offline-first PWA', body: 'Fill & sign tickets with zero bars. Auto-syncs the moment the truck hits coverage.' },
    { icon: <PenLine />, title: 'Sign on glass', body: 'The Company Man signs the tablet; captured as a tamper-evident image.' },
    { icon: <MapPin />, title: 'GPS proof stamp', body: 'Every signature locked to real lease coordinates, time & device hash.' },
    { icon: <ShieldCheck />, title: 'AFE billing guardrail', body: 'Blocks sign-off until the operator’s required AFE# / PO# / LOE is valid.' },
    { icon: <Gauge />, title: 'Tank-strap gauges', body: 'Top/bottom gauge, BS&W% and BBL math captured with a photo of the readout.' },
    { icon: <FileText />, title: '1-click QuickBooks', body: 'Auto-priced invoice + signed PDF pushed to QBO — single or bulk.' },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-50">
        Everything the ticket needs — in one tap
      </h2>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title} className="group rounded-2xl border border-rig-border bg-rig-card/70 p-5 backdrop-blur transition hover:border-amber-500/40 hover:bg-rig-card">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-400 transition group-hover:bg-amber-500 group-hover:text-slate-900">
              {f.icon}
            </div>
            <h3 className="mt-4 font-bold text-slate-100">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function HowItWorks() {
  const steps = [
    { icon: <Signal />, n: '01', t: 'Collect at the well', d: 'Driver gauges the tank, pulls the load, logs BBLs, times & standby.' },
    { icon: <Fuel />, n: '02', t: 'Haul & sign', d: 'Company Man signs on glass; GPS + timestamp lock the proof.' },
    { icon: <Truck />, n: '03', t: 'Release at the SWD', d: 'Water injected downhole; ticket queues offline in the dead zone.' },
    { icon: <Zap />, n: '04', t: 'Sync & bill', d: 'Back in coverage it syncs to the office and pushes to QuickBooks.' },
  ];
  return (
    <section className="border-y border-rig-border/60 bg-rig-panel/40 py-16">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-50">From wellhead to paid</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-rig-border bg-rig-card/70 p-5">
              <div className="font-mono text-3xl font-black text-rig-border">{s.n}</div>
              <div className="mt-2 grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">{s.icon}</div>
              <h3 className="mt-3 font-bold text-slate-100">{s.t}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
function FinalCta({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-rig-card to-emerald-500/10 p-10 sm:p-14">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl" />
        <h2 className="relative text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
          See a ticket sync in 90 seconds.
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-slate-300">
          Open the split-screen demo: create an offline ticket on the driver tablet, flip to online,
          and watch it land in the back office and push to QuickBooks — live.
        </p>
        <button
          onClick={onLaunch}
          className="group relative mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-lg font-extrabold text-slate-900 shadow-xl shadow-amber-500/25 transition hover:bg-amber-400"
        >
          <Zap size={20} /> Launch the Live Demo
          <ArrowRight size={20} className="transition group-hover:translate-x-1" />
        </button>
        <div className="relative mt-4 text-xs text-slate-400">No sign-up · Seed data pre-loaded · Resets anytime</div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Contact — displays the email directly (no form → spam-proof, no backend).   */
function Contact() {
  const email = 'rajansharmagndu111@gmail.com';
  const subject = 'RigTicket Sync — Demo Inquiry';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-4xl px-5 py-16">
      <div className="rounded-3xl border border-rig-border bg-rig-card/60 p-8 text-center backdrop-blur sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-400">
          <Mail size={26} />
        </div>
        <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-50">Contact Us</h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-400">
          Want a walkthrough, pricing for your fleet, or a pilot on your own tickets?
          Reach out directly — we reply fast.
        </p>

        {/* Email pill */}
        <div className="mx-auto mt-7 flex max-w-md flex-col items-stretch gap-2 sm:flex-row">
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 font-mono text-sm font-bold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Mail size={16} />
            {email}
          </a>
          <button
            onClick={copy}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rig-border bg-rig-bg px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-rig-panel"
            title="Copy email address"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Prefer email over a form — no spam, straight to our inbox.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-rig-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-slate-900"><Truck size={15} /></div>
          <span className="font-mono text-slate-400">RigTicket Sync</span>
        </div>
        <span>Pecos Valley Vacuum & Roustabout LLC · Permian Basin demo · © 2026</span>
      </div>
    </footer>
  );
}
