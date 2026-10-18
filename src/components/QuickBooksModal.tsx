// ============================================================================
// 1-Click QuickBooks Online (QBO) Sync Modal (single + bulk).
// ============================================================================
import { useState } from 'react';
import { X, CheckCircle2, Paperclip, Loader2, Link2 } from 'lucide-react';
import type { FieldTicket } from '../types';
import { useStore } from '../store';
import { Modal } from './ui';
import { computeBreakdown, money } from '../lib/pricing';
import { SERVICE_COMPANY } from '../seed';

export default function QuickBooksModal({
  tickets,
  bulk,
  onClose,
}: {
  tickets: FieldTicket[];
  bulk: boolean;
  onClose: () => void;
}) {
  const store = useStore();
  const [phase, setPhase] = useState<'preview' | 'syncing' | 'done'>('preview');
  const [invoiceIds, setInvoiceIds] = useState<string[]>([]);

  if (tickets.length === 0) return null;
  const single = tickets[0];
  const operator = store.getOperator(single.operatorId);
  const lease = store.leases.find((l) => l.id === single.leaseId);
  const b = computeBreakdown(single, operator);

  const grandTotal = tickets.reduce((sum, t) => sum + computeBreakdown(t, store.getOperator(t.operatorId)).total, 0);

  async function confirm() {
    setPhase('syncing');
    const ids: string[] = [];
    if (bulk) {
      for (const t of tickets) {
        const id = await store.billTicket(t.id);
        ids.push(id);
        await new Promise((r) => setTimeout(r, 420));
      }
    } else {
      const id = await store.billTicket(single.id);
      ids.push(id);
      await new Promise((r) => setTimeout(r, 1100));
    }
    setInvoiceIds(ids);
    setPhase('done');
    store.pushToast({
      kind: 'bill',
      title: bulk ? `${ids.length} invoices generated` : 'QuickBooks invoice generated',
      message: bulk ? `${ids.join(', ')}` : `${ids[0]} · ${operator.name}`,
    });
  }

  return (
    <Modal open onClose={onClose}>
      <div className="rounded-xl border border-rig-border bg-rig-card">
        {/* header */}
        <div className="flex items-center justify-between border-b border-rig-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#2ca01c] font-bold text-white">qb</div>
            <span className="text-sm font-bold text-slate-200">
              {bulk ? `Bulk Push ${tickets.length} Tickets to QuickBooks` : 'Push to QuickBooks Online'}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg border border-rig-border bg-rig-bg px-2 py-2 text-slate-300 hover:bg-rig-panel">
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* connection status */}
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <Link2 size={15} />
            <span className="font-semibold">
              Connected to QuickBooks Online — Company: {SERVICE_COMPANY.name} · Realm ID: {SERVICE_COMPANY.qboRealmId}
            </span>
          </div>

          {phase === 'done' ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-100">
                {bulk ? `${invoiceIds.length} Invoices Created in QuickBooks` : 'Invoice Created in QuickBooks'}
              </h3>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {invoiceIds.map((id) => (
                  <span key={id} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-mono text-sm font-bold text-emerald-300">{id}</span>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Signed field ticket PDF{bulk ? 's' : ''} auto-attached. Operator A/P receives invoice + proof in one email.
              </p>
              <button onClick={onClose} className="mt-5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-amber-400">Done</button>
            </div>
          ) : bulk ? (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Mapped QBO Invoices ({tickets.length})</div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {tickets.map((t) => {
                  const op = store.getOperator(t.operatorId);
                  const bb = computeBreakdown(t, op);
                  return (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-rig-border bg-rig-panel px-3 py-2 text-sm">
                      <div>
                        <span className="font-mono font-bold text-amber-400">{t.ticketNo}</span>
                        <span className="ml-2 text-slate-400">{op.name}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{money(bb.total)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-rig-panel px-3 py-2">
                <span className="text-sm font-bold text-slate-200">Grand Total</span>
                <span className="font-mono text-lg font-bold text-emerald-400">{money(grandTotal)}</span>
              </div>
              <ConfirmButton phase={phase} onClick={confirm} label={`Confirm & Generate ${tickets.length} Invoices`} />
            </div>
          ) : (
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Mapped QBO Invoice Preview</div>
              <div className="space-y-1.5 rounded-lg border border-rig-border bg-rig-bg p-3 font-mono text-xs text-slate-300">
                <Line k="CustomerRef" v={operator.name} />
                <Line k="CustomField [AFE_Number]" v={single.afeNumber || '—'} />
                <Line k="CustomField [PO_Number]" v={single.poNumber || '—'} />
                <Line k="CustomField [Lease_Well]" v={`${lease?.name ?? '—'} · ${lease?.apiNumber ?? ''}`} />
                <div className="my-1 border-t border-rig-border" />
                <Line k="Line[0]" v={`${b.haulLabel} (${b.haulQty} ${b.haulUnit} @ ${money(b.haulRate)}/${b.haulUnit} = ${money(b.haulCharge)})`} />
                <Line k="Line[1]" v={`Demurrage / Standby (${b.standbyHrs} Hrs @ ${money(b.standbyRate)}/hr = ${money(b.standbyCharge)})`} />
                <Line k="Line[2]" v={`Fuel Surcharge (${(b.fuelSurchargePct * 100).toFixed(0)}% = ${money(b.fuelSurcharge)})`} />
                <div className="my-1 border-t border-rig-border" />
                <Line k="TotalAmt" v={money(b.total)} bold />
                <div className="flex items-center gap-1.5 pt-1 text-sky-300">
                  <Paperclip size={12} /> Attachment: {single.ticketNo}_Signed_Field_Ticket.pdf
                </div>
              </div>
              <ConfirmButton phase={phase} onClick={confirm} label="Confirm & Generate QuickBooks Invoice" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ConfirmButton({ phase, onClick, label }: { phase: string; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={phase === 'syncing'}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2ca01c] px-5 py-3 text-sm font-extrabold text-white shadow transition hover:bg-[#248016] disabled:opacity-60"
    >
      {phase === 'syncing' ? (
        <><Loader2 size={18} className="animate-spin" /> Syncing to QuickBooks…</>
      ) : (
        label
      )}
    </button>
  );
}

function Line({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-40 shrink-0 text-slate-500">{k}:</span>
      <span className={bold ? 'font-bold text-emerald-400' : 'text-slate-200'}>{v}</span>
    </div>
  );
}
