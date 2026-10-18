// ============================================================================
// Ticket creation helpers — new blank ticket + GPS stamp.
// ============================================================================
import type { FieldTicket, GpsStamp, Lease } from '../types';
import { OPERATORS, EQUIPMENT } from '../seed';
import { nextTicketNo, nextBolNo } from './storage';

export function makeGpsStamp(lease: Lease | null): GpsStamp {
  const fallback = { gps: '31.4229° N, 103.4932° W', county: 'Ward County, TX' };
  return {
    coordinates: lease?.gps ?? fallback.gps,
    county: lease ? `${lease.county}, ${lease.state}` : fallback.county,
    accuracy: '±4m',
    timestamp: new Date().toISOString(),
    deviceHash: '0x' + Math.random().toString(16).slice(2, 14).toUpperCase(),
  };
}

export function emptyTicket(): FieldTicket {
  return {
    id: 'tkt-' + Math.random().toString(36).slice(2, 10),
    ticketNo: nextTicketNo(),
    bolNo: nextBolNo(),
    createdAt: new Date().toISOString(),
    driverName: EQUIPMENT.drivers[0],
    truckNo: EQUIPMENT.trucks[0],
    trailerNo: EQUIPMENT.trailers[0],
    operatorId: OPERATORS[0].id,
    leaseId: null,
    swdId: null,
    jobType: 'Produced Water Haul',
    afeNumber: '',
    poNumber: '',
    costCode: '',
    tank: { tankNo: '', topGauge: '', bottomGauge: '', bswPct: 0, netBbls: 0 },
    totalBbls: 0,
    timeArrivedLease: '',
    timeLoaded: '',
    timeArrivedSwd: '',
    timeUnloaded: '',
    standbyHrs: 0,
    standbyReason: '',
    roustaboutHrs: 0,
    hazard: { jsaCompleted: false, h2sMonitorWorn: false, wheelChocksGroundingSet: false },
    notes: '',
    gaugePhoto: null,
    companyManName: '',
    companyManPhone: '',
    signature: null,
    gps: null,
    status: 'Queued on Device (Offline)',
    qboInvoiceId: null,
  };
}

/** A fully pre-filled ticket for 1-click demo creation. */
export function sampleOfflineTicket(): FieldTicket {
  const base = emptyTicket();
  return {
    ...base,
    driverName: 'Cole Ramirez',
    truckNo: 'Unit #104 - Peterbilt 389 Vac',
    trailerNo: 'Trailer #T-22 - 130 BBL Dragon Vacuum',
    operatorId: 'op-permian',
    leaseId: 'lease-mustang',
    swdId: 'swd-pecos',
    jobType: 'Produced Water Haul',
    afeNumber: 'AFE-4821',
    poNumber: 'PO-99120',
    costCode: 'LOE-8410 Water Hauling',
    tank: { tankNo: 'Tank #3 - 500 BBL Upright', topGauge: "12' 06\"", bottomGauge: "08' 11\"", bswPct: 3.2, netBbls: 130 },
    totalBbls: 130,
    timeArrivedLease: '06:35',
    timeLoaded: '07:20',
    timeArrivedSwd: '08:10',
    timeUnloaded: '09:25',
    standbyHrs: 1.5,
    standbyReason: 'Waiting on SWD Line',
    roustaboutHrs: 0,
    hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
    notes: 'Quick-fill demo ticket — produced water pull from Mustang State Unit.',
    companyManName: 'Cody Jenkins',
    companyManPhone: 'Radio Ch 4 / (432) 555-0188',
  };
}
