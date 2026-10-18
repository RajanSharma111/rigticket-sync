// ============================================================================
// Traditional carbon-copy oilfield Field Ticket PDF modal (print-ready).
// ============================================================================
import { Printer, X } from 'lucide-react';
import type { FieldTicket } from '../types';
import { useStore } from '../store';
import { Modal } from './ui';
import { computeBreakdown, money } from '../lib/pricing';
import { fmtDate } from '../lib/format';
import { SERVICE_COMPANY } from '../seed';

export default function CarbonTicketModal({
  ticket,
  onClose,
}: {
  ticket: FieldTicket | null;
  onClose: () => void;
}) {
  const store = useStore();
  if (!ticket) return null;
  const operator = store.getOperator(ticket.operatorId);
  const lease = store.leases.find((l) => l.id === ticket.leaseId);
  const swd = store.swdSites.find((s) => s.id === ticket.swdId);
  const b = computeBreakdown(ticket, operator);

  return (
    <Modal open={!!ticket} onClose={onClose} wide>
      <div className="rounded-xl bg-rig-card">
        {/* toolbar */}
        <div className="no-print flex items-center justify-between border-b border-rig-border px-4 py-3">
          <span className="text-sm font-bold text-slate-200">Carbon-Copy Field Ticket · {ticket.ticketNo}</span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-amber-400"
            >
              <Printer size={14} /> 🖨️ Print / Save PDF
            </button>
            <button onClick={onClose} className="rounded-lg border border-rig-border bg-rig-bg px-3 py-2 text-slate-300 hover:bg-rig-panel">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* printable area — styled like a yellow/white carbon copy */}
        <div className="max-h-[75vh] overflow-y-auto p-4">
          <div
            id="print-area"
            className="mx-auto w-full bg-[#fffdf2] p-6 text-slate-900 shadow-inner"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b-4 border-double border-slate-800 pb-3">
              <div>
                <div className="text-lg font-extrabold uppercase tracking-tight">{SERVICE_COMPANY.name}</div>
                <div className="text-[11px]">{SERVICE_COMPANY.address} · {SERVICE_COMPANY.phone}</div>
                <div className="text-[11px] font-bold">{SERVICE_COMPANY.dot}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-red-700">Field Ticket No.</div>
                <div className="text-2xl font-extrabold text-red-700">{ticket.ticketNo}</div>
                <div className="text-[11px]">Date: {fmtDate(ticket.createdAt)}</div>
                <div className="text-[11px]">BOL/Manifest: {ticket.bolNo}</div>
              </div>
            </div>

            {/* Grid of header fields */}
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] sm:grid-cols-3">
              <Cell label="Operator" value={operator.name} />
              <Cell label="Lease / Well" value={lease?.name ?? '—'} />
              <Cell label="API #" value={lease?.apiNumber ?? '—'} />
              <Cell label="County / State" value={lease ? `${lease.county}, ${lease.state}` : '—'} />
              <Cell label="SWD / Disposal" value={swd?.name ?? '—'} />
              <Cell label="Job Type" value={ticket.jobType} />
              <Cell label="AFE #" value={ticket.afeNumber || '—'} />
              <Cell label="PO # / WO" value={ticket.poNumber || '—'} />
              <Cell label="Cost Code / LOE" value={ticket.costCode || '—'} />
              <Cell label="Unit / Truck #" value={ticket.truckNo} />
              <Cell label="Trailer #" value={ticket.trailerNo} />
              <Cell label="Driver / Pusher" value={ticket.driverName} />
            </div>

            {/* Tank gauge table */}
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-bold uppercase">Tank Strap / Gauge Readings</div>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-800 text-[#fffdf2]">
                    <Th>Tank #</Th><Th>Top Gauge</Th><Th>Bottom Gauge</Th><Th>BS&W %</Th><Th>Net BBLs</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>{ticket.tank?.tankNo || '—'}</Td>
                    <Td>{ticket.tank?.topGauge || '—'}</Td>
                    <Td>{ticket.tank?.bottomGauge || '—'}</Td>
                    <Td>{ticket.tank ? `${ticket.tank.bswPct}%` : '—'}</Td>
                    <Td>{ticket.totalBbls || (ticket.roustaboutHrs ? `${ticket.roustaboutHrs} hr` : '—')}</Td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rate breakdown */}
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-bold uppercase">Itemized Charges</div>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-slate-800 text-[#fffdf2]">
                    <Th>Description</Th><Th>Qty</Th><Th>Rate</Th><Th right>Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>{b.haulLabel}</Td>
                    <Td>{b.haulQty} {b.haulUnit}</Td>
                    <Td>{money(b.haulRate)}/{b.haulUnit}</Td>
                    <Td right>{money(b.haulCharge)}</Td>
                  </tr>
                  <tr>
                    <Td>Demurrage / Standby ({ticket.standbyReason || 'Standby'})</Td>
                    <Td>{b.standbyHrs} hr</Td>
                    <Td>{money(b.standbyRate)}/hr</Td>
                    <Td right>{money(b.standbyCharge)}</Td>
                  </tr>
                  <tr>
                    <Td>Fuel Surcharge (FSC)</Td>
                    <Td>{(b.fuelSurchargePct * 100).toFixed(0)}%</Td>
                    <Td>—</Td>
                    <Td right>{money(b.fuelSurcharge)}</Td>
                  </tr>
                  <tr className="border-t-2 border-slate-800 font-extrabold">
                    <Td>TOTAL INVOICE AMOUNT</Td>
                    <Td></Td><Td></Td>
                    <Td right>{money(b.total)}</Td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Proof block */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase">Tank Gauge Photo</div>
                {ticket.gaugePhoto && ticket.gaugePhoto !== 'SIMULATED' ? (
                  <img src={ticket.gaugePhoto} alt="gauge" className="h-24 w-full rounded border border-slate-400 object-cover" />
                ) : (
                  <div className="grid h-24 place-items-center rounded border border-dashed border-slate-400 text-[10px] text-slate-500">
                    {ticket.gaugePhoto === 'SIMULATED' ? 'GAUGE PHOTO ON FILE' : 'No photo'}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase">Company Man Signature</div>
                {ticket.signature ? (
                  <img src={ticket.signature} alt="signature" className="h-24 w-full rounded border border-slate-400 bg-white object-contain" />
                ) : (
                  <div className="grid h-24 place-items-center rounded border border-dashed border-slate-400 text-[10px] text-slate-500">Unsigned</div>
                )}
                <div className="mt-1 text-[11px]">{ticket.companyManName || '—'}</div>
                <div className="text-[10px] text-slate-600">{ticket.companyManPhone}</div>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase">GPS Verification</div>
                <div className="rounded border border-emerald-700/50 bg-emerald-50 p-2 text-[10px] leading-snug">
                  {ticket.gps ? (
                    <>
                      <div className="font-bold text-emerald-800">✔ CRYPTOGRAPHICALLY STAMPED</div>
                      <div>Signed at {ticket.gps.coordinates}</div>
                      <div>{ticket.gps.county} · {ticket.gps.accuracy}</div>
                      <div>{new Date(ticket.gps.timestamp).toLocaleString()}</div>
                      <div className="break-all">Device: {ticket.gps.deviceHash}</div>
                    </>
                  ) : (
                    <span className="text-slate-500">No GPS stamp</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-400 pt-2 text-center text-[9px] text-slate-500">
              Digital carbon-copy generated by RigTicket Sync · Status: {ticket.status}
              {ticket.qboInvoiceId ? ` · ${ticket.qboInvoiceId}` : ''}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-dotted border-slate-400 pb-0.5">
      <span className="text-[9px] font-bold uppercase text-slate-500">{label}</span>
      <div className="font-bold">{value}</div>
    </div>
  );
}
function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`border border-slate-700 px-2 py-1 ${right ? 'text-right' : 'text-left'}`}>{children}</th>;
}
function Td({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <td className={`border border-slate-400 px-2 py-1 ${right ? 'text-right' : 'text-left'}`}>{children}</td>;
}
