# RigTicket Sync

**Offline-First Oilfield Water Hauling & Roustabout Field Ticketing PWA + QuickBooks Invoicing Bridge.**

A self-contained React + TypeScript + Tailwind demo built to sell field-ticketing
software to small/midsize oilfield service companies (10–75 trucks) in the Permian
and Bakken basins that are still running 3-part carbon-copy paper tickets.

## Run it

```bash
cd rigticket-sync
npm install
npm run dev      # dev server (Vite)
# or
npm run build && npm run preview   # production build + static preview
```

Open the printed localhost URL in a browser.

## The 90-second sales demo

1. Leave the top bar on **⚡ Split-Screen Live Demo Mode** (tablet left, office right).
2. Flip the network toggle to **🔴 OFFLINE — DEAD ZONE**.
3. On the driver tablet click **⚡ Quick-Fill Demo Ticket & Signature**, then **Save to Device Vault**.
   - Note the ticket sits in the **Device Outbox** as `🟠 Queued on Device` — the office does *not* see it.
4. Flip the toggle to **🟢 ONLINE — 4G LTE**.
   - Watch the animated sync bar, then the ticket pops into the Back-Office table with a toast.
5. In the office, click **⚡ Push** (or **Bulk Push All Ready Tickets**) to generate a
   QuickBooks invoice, auto-attach the signed PDF, and watch the KPI banner tick up.
6. Click **📄 PDF** on any ticket to open the classic carbon-copy field ticket and **🖨️ Print / Save PDF**.
7. **Reset Demo Data** in the top bar restores the seed state between pitches.

## What's inside

- **Module A** — Driver Offline Field Ticket PWA (3-step flow: header + billing guardrail,
  gauges/time/standby/photo, Sign-on-Glass + GPS stamp). Rugged dark/amber/emerald UI.
- **Module B** — Local Device Outbox queue with offline/synced/billed status badges.
- **Module C** — Back-Office Dispatch, Rate Sheet & QuickBooks portal (KPI ROI banner,
  pricing engine, filterable ticket queue, carbon-copy PDF modal, 1-click & bulk QBO sync).
- **Smart Billing Guardrail** — operator-specific AFE / PO / Cost Code enforcement that
  blocks sign-off (the #1 cause of 60-day invoice rejections).
- **Offline-first** — tickets, queue, connectivity toggle, and sequence counters persist in
  `localStorage` (the "Device Vault"); offline tickets are withheld from the office until sync.

## Domain vocabulary

Operator (E&P customer), Service Company (the fleet), Company Man (signs on glass),
Lease / Well + API #, SWD disposal well, BBLs, Tank Strap / Gauge readings, BS&W %,
Demurrage / Standby, AFE # / PO # / LOE Cost Code, BOL / Manifest #, Unit / Truck #, Trailer #.

Seed data is realistic Permian Basin (Reeves/Ward/Loving County TX, Lea County NM).

## Tech

React 19 · TypeScript · Vite · Tailwind CSS v3 · lucide-react. Zero backend — the QuickBooks
and GPS integrations are faithfully simulated for the demo.
