// ============================================================================
// localStorage persistence layer (acts as the "Device Vault" + office store).
// ============================================================================
import type { FieldTicket, NetworkStatus } from '../types';
import { makeSeedTickets } from '../seed';

const KEY_TICKETS = 'rigticket.tickets.v1';
const KEY_NETWORK = 'rigticket.network.v1';
const KEY_SEQ = 'rigticket.seq.v1';
const KEY_QBO_SEQ = 'rigticket.qboseq.v1';

export function loadTickets(): FieldTicket[] {
  try {
    const raw = localStorage.getItem(KEY_TICKETS);
    if (!raw) {
      const seed = makeSeedTickets();
      localStorage.setItem(KEY_TICKETS, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as FieldTicket[];
  } catch {
    return makeSeedTickets();
  }
}

export function saveTickets(tickets: FieldTicket[]): void {
  localStorage.setItem(KEY_TICKETS, JSON.stringify(tickets));
}

export function loadNetwork(): NetworkStatus {
  const raw = localStorage.getItem(KEY_NETWORK);
  return raw === 'offline' ? 'offline' : 'online';
}

export function saveNetwork(status: NetworkStatus): void {
  localStorage.setItem(KEY_NETWORK, status);
}

export function nextTicketNo(): string {
  const cur = Number(localStorage.getItem(KEY_SEQ) ?? '849');
  const next = cur + 1;
  localStorage.setItem(KEY_SEQ, String(next));
  return `FT-2026-${String(next).padStart(4, '0')}`;
}

export function nextBolNo(): string {
  return `BOL-${Math.floor(884413 + Math.random() * 500)}`;
}

export function nextQboInvoiceId(): string {
  const cur = Number(localStorage.getItem(KEY_QBO_SEQ) ?? '10939');
  const next = cur + 1;
  localStorage.setItem(KEY_QBO_SEQ, String(next));
  return `QBO-INV-${next}`;
}

export function resetDemoData(): void {
  localStorage.removeItem(KEY_TICKETS);
  localStorage.removeItem(KEY_SEQ);
  localStorage.removeItem(KEY_QBO_SEQ);
  localStorage.setItem(KEY_NETWORK, 'online');
}
