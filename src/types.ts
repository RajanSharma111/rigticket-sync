// ============================================================================
// RigTicket Sync — Domain Types
// Authentic oilfield water hauling & roustabout ticketing vocabulary.
// ============================================================================

export type JobType =
  | 'Produced Water Haul'
  | 'Fresh Water Haul'
  | 'Flowback / Pit Cleaning'
  | 'Roustabout Crew Labor'
  | 'Hot-Shot Freight';

export type TicketStatus =
  | 'Queued on Device (Offline)'
  | 'Synced - Ready to Bill'
  | 'Needs Review'
  | 'Billed in QuickBooks';

/** Billing compliance code an Operator requires before a ticket can be billed. */
export type BillingRuleCode = 'AFE' | 'PO' | 'CostCode';

export interface RateSheet {
  /** $/BBL for produced water hauling (if offered) */
  producedWaterPerBbl?: number;
  /** $/BBL for fresh water hauling (if offered) */
  freshWaterPerBbl?: number;
  /** $/hr for vacuum / pit cleaning (if offered) */
  vacuumPerHr?: number;
  /** $/hr for roustabout crew labor (if offered) */
  roustaboutPerHr?: number;
  /** $/hr demurrage / standby */
  standbyPerHr: number;
  /** Fuel surcharge percent, e.g. 0.08 = 8% */
  fuelSurchargePct: number;
}

export interface Operator {
  id: string;
  name: string;
  /** Compliance codes required before sign-off (prevents invoice rejection). */
  requiredCodes: BillingRuleCode[];
  rateSheet: RateSheet;
}

export interface Lease {
  id: string;
  operatorId: string;
  name: string;
  apiNumber: string;
  county: string;
  state: 'TX' | 'NM' | 'ND';
  gps: string; // "31.4229° N, 103.4932° W"
}

export interface SwdSite {
  id: string;
  name: string;
  location: string;
}

export interface Equipment {
  drivers: string[];
  trucks: string[];
  trailers: string[];
}

export interface TankGauge {
  tankNo: string;
  topGauge: string; // "12' 04\""
  bottomGauge: string; // "08' 10\""
  bswPct: number;
  netBbls: number;
}

export interface HazardChecklist {
  jsaCompleted: boolean;
  h2sMonitorWorn: boolean;
  wheelChocksGroundingSet: boolean;
}

export interface GpsStamp {
  coordinates: string; // "31.4229° N, 103.4932° W"
  county: string;
  accuracy: string; // "±4m"
  timestamp: string; // ISO
  deviceHash: string;
}

/** Computed rate breakdown for a ticket. */
export interface RateBreakdown {
  haulLabel: string;
  haulQty: number; // bbls or hrs
  haulUnit: 'BBL' | 'hr';
  haulRate: number;
  haulCharge: number;
  standbyHrs: number;
  standbyRate: number;
  standbyCharge: number;
  fuelSurchargePct: number;
  fuelSurcharge: number;
  total: number;
}

export interface FieldTicket {
  id: string; // internal uuid
  ticketNo: string; // FT-2026-0849
  bolNo: string; // BOL manifest #
  createdAt: string; // ISO
  // --- Header ---
  driverName: string;
  truckNo: string;
  trailerNo: string;
  operatorId: string;
  leaseId: string | null;
  swdId: string | null;
  jobType: JobType;
  // --- Billing codes ---
  afeNumber: string;
  poNumber: string;
  costCode: string;
  // --- Load / gauges ---
  tank: TankGauge | null;
  totalBbls: number;
  // --- Time / demurrage ---
  timeArrivedLease: string;
  timeLoaded: string;
  timeArrivedSwd: string;
  timeUnloaded: string;
  standbyHrs: number;
  standbyReason: string;
  roustaboutHrs: number; // for labor jobs
  // --- Hazard / notes ---
  hazard: HazardChecklist;
  notes: string;
  // --- Photo ---
  gaugePhoto: string | null; // data-url or simulated card id
  // --- Sign on glass ---
  companyManName: string;
  companyManPhone: string;
  signature: string | null; // data-url
  gps: GpsStamp | null;
  // --- Status / billing ---
  status: TicketStatus;
  qboInvoiceId: string | null;
}

export type ViewMode = 'driver' | 'office' | 'split';
export type NetworkStatus = 'online' | 'offline';
export type DriverTab = 'new' | 'outbox';
