// ============================================================================
// Pre-loaded realistic Permian Basin seed data.
// ============================================================================
import type {
  Operator,
  Lease,
  SwdSite,
  Equipment,
  FieldTicket,
} from './types';

export const SERVICE_COMPANY = {
  name: 'Pecos Valley Vacuum & Roustabout LLC',
  dot: 'USDOT #3194820',
  address: '2201 S Cedar St, Pecos, TX 79772',
  phone: '(432) 445-0119',
  qboRealmId: '9130349201',
};

export const OPERATORS: Operator[] = [
  {
    id: 'op-permian',
    name: 'Permian Resources',
    requiredCodes: ['AFE', 'PO'],
    rateSheet: {
      producedWaterPerBbl: 2.35,
      freshWaterPerBbl: 1.95,
      vacuumPerHr: 120,
      roustaboutPerHr: 160,
      standbyPerHr: 95,
      fuelSurchargePct: 0.08,
    },
  },
  {
    id: 'op-mewbourne',
    name: 'Mewbourne Oil Company',
    requiredCodes: ['CostCode'],
    rateSheet: {
      producedWaterPerBbl: 2.45,
      freshWaterPerBbl: 2.05,
      vacuumPerHr: 125,
      roustaboutPerHr: 170,
      standbyPerHr: 100,
      fuelSurchargePct: 0.08,
    },
  },
  {
    id: 'op-devon',
    name: 'Devon Energy',
    requiredCodes: ['AFE'],
    rateSheet: {
      producedWaterPerBbl: 2.40,
      freshWaterPerBbl: 1.95,
      vacuumPerHr: 130,
      roustaboutPerHr: 165,
      standbyPerHr: 105,
      fuelSurchargePct: 0.08,
    },
  },
  {
    id: 'op-diamondback',
    name: 'Diamondback Energy',
    requiredCodes: ['PO'],
    rateSheet: {
      producedWaterPerBbl: 2.30,
      freshWaterPerBbl: 1.90,
      vacuumPerHr: 125,
      roustaboutPerHr: 160,
      standbyPerHr: 95,
      fuelSurchargePct: 0.08,
    },
  },
];

export const LEASES: Lease[] = [
  {
    id: 'lease-mustang',
    operatorId: 'op-permian',
    name: 'Mustang State Unit #4H',
    apiNumber: '42-389-39402',
    county: 'Reeves County',
    state: 'TX',
    gps: '31.4229° N, 103.4932° W',
  },
  {
    id: 'lease-bonespring',
    operatorId: 'op-devon',
    name: 'Bone Spring Federal #12H',
    apiNumber: '30-025-48291',
    county: 'Lea County',
    state: 'NM',
    gps: '32.1045° N, 103.3510° W',
  },
  {
    id: 'lease-wolfcamp',
    operatorId: 'op-diamondback',
    name: 'Wolfcamp Draw 24-1H',
    apiNumber: '42-475-37119',
    county: 'Ward County',
    state: 'TX',
    gps: '31.5120° N, 103.1194° W',
  },
  {
    id: 'lease-rattlesnake',
    operatorId: 'op-mewbourne',
    name: 'Rattlesnake Ridge #7H',
    apiNumber: '42-301-34901',
    county: 'Loving County',
    state: 'TX',
    gps: '31.8492° N, 103.5812° W',
  },
];

export const SWD_SITES: SwdSite[] = [
  { id: 'swd-pecos', name: 'Pecos Commercial SWD #2', location: 'Pecos, TX' },
  { id: 'swd-redbluff', name: 'Red Bluff Stateline SWD #1', location: 'Orla, TX' },
  { id: 'swd-jal', name: 'Jal Deep Injection SWD #4', location: 'Jal, NM' },
  { id: 'swd-na', name: 'N/A - Roustabout Labor', location: '—' },
];

export const EQUIPMENT: Equipment = {
  drivers: [
    'Cole Ramirez',
    'Dustin Hanks',
    'Travis McAllen',
    'Jesse Clawson',
    'Marcus DeLeon',
  ],
  trucks: [
    'Unit #104 - Peterbilt 389 Vac',
    'Unit #107 - Kenworth W900 Vac',
    'Unit #112 - Mack Anthem Vac',
    'Unit #119 - Peterbilt 579 Vac',
  ],
  trailers: [
    'Trailer #T-22 - 130 BBL Dragon Vacuum',
    'Trailer #T-18 - 130 BBL Dragon Vacuum',
    'Trailer #T-31 - 140 BBL Troxell Vacuum',
    'Trailer #T-09 - 110 BBL Wichita Vacuum',
  ],
};

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function gps(lease: Lease, offsetMin: number): FieldTicket['gps'] {
  return {
    coordinates: lease.gps,
    county: `${lease.county}, ${lease.state}`,
    accuracy: '±4m',
    timestamp: hoursAgo(offsetMin / 60),
    deviceHash: '0x' + Math.random().toString(16).slice(2, 14).toUpperCase(),
  };
}

// A tiny inline SVG signature so pre-seeded tickets look signed.
const DEMO_SIG =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='100'>
      <rect width='300' height='100' fill='white'/>
      <path d='M20 70 C 40 20, 60 90, 90 50 S 140 10, 170 60 S 230 90, 280 40'
        stroke='#1e3a8a' stroke-width='3' fill='none' stroke-linecap='round'/>
    </svg>`.replace(/\n\s*/g, ' '),
  );

export function makeSeedTickets(): FieldTicket[] {
  return [
    // ---- Ready to bill #1 (Permian / Mustang / Produced Water + standby) ----
    {
      id: 'tkt-0841',
      ticketNo: 'FT-2026-0841',
      bolNo: 'BOL-884410',
      createdAt: hoursAgo(5),
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
      tank: { tankNo: 'Tank #2 - 500 BBL Upright', topGauge: "12' 04\"", bottomGauge: "08' 10\"", bswPct: 3.5, netBbls: 130 },
      totalBbls: 130,
      timeArrivedLease: '06:40',
      timeLoaded: '07:25',
      timeArrivedSwd: '08:15',
      timeUnloaded: '09:30',
      standbyHrs: 1.5,
      standbyReason: 'Waiting on SWD Line',
      roustaboutHrs: 0,
      hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
      notes: 'Normal pull. Minor line backup at disposal.',
      gaugePhoto: 'SIMULATED',
      companyManName: 'Cody Jenkins',
      companyManPhone: 'Radio Ch 4 / (432) 555-0188',
      signature: DEMO_SIG,
      gps: gps(LEASES[0], 60),
      status: 'Synced - Ready to Bill',
      qboInvoiceId: null,
    },
    // ---- Ready to bill #2 (Devon / Bone Spring / Fresh Water) ----
    {
      id: 'tkt-0842',
      ticketNo: 'FT-2026-0842',
      bolNo: 'BOL-884411',
      createdAt: hoursAgo(4),
      driverName: 'Dustin Hanks',
      truckNo: 'Unit #107 - Kenworth W900 Vac',
      trailerNo: 'Trailer #T-31 - 140 BBL Troxell Vacuum',
      operatorId: 'op-devon',
      leaseId: 'lease-bonespring',
      swdId: 'swd-jal',
      jobType: 'Fresh Water Haul',
      afeNumber: 'AFE-7745',
      poNumber: '',
      costCode: '',
      tank: { tankNo: 'Tank #1 - Frac Tank', topGauge: "14' 00\"", bottomGauge: "09' 06\"", bswPct: 0.5, netBbls: 135 },
      totalBbls: 135,
      timeArrivedLease: '05:50',
      timeLoaded: '06:30',
      timeArrivedSwd: '07:20',
      timeUnloaded: '08:05',
      standbyHrs: 0.5,
      standbyReason: 'Locked Lease Gate',
      roustaboutHrs: 0,
      hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
      notes: 'Fresh water to completion rig.',
      gaugePhoto: 'SIMULATED',
      companyManName: 'Brent Oswalt',
      companyManPhone: 'Radio Ch 2 / (575) 555-0132',
      signature: DEMO_SIG,
      gps: gps(LEASES[1], 45),
      status: 'Synced - Ready to Bill',
      qboInvoiceId: null,
    },
    // ---- Ready to bill #3 (Diamondback / Wolfcamp / Vacuum Pit Clean) ----
    {
      id: 'tkt-0843',
      ticketNo: 'FT-2026-0843',
      bolNo: 'BOL-884412',
      createdAt: hoursAgo(3),
      driverName: 'Travis McAllen',
      truckNo: 'Unit #112 - Mack Anthem Vac',
      trailerNo: 'Trailer #T-18 - 130 BBL Dragon Vacuum',
      operatorId: 'op-diamondback',
      leaseId: 'lease-wolfcamp',
      swdId: 'swd-redbluff',
      jobType: 'Flowback / Pit Cleaning',
      afeNumber: '',
      poNumber: 'PO-55021',
      costCode: '',
      tank: null,
      totalBbls: 0,
      timeArrivedLease: '10:10',
      timeLoaded: '—',
      timeArrivedSwd: '—',
      timeUnloaded: '—',
      standbyHrs: 2.0,
      standbyReason: 'Waiting on Company Man',
      roustaboutHrs: 4.0,
      hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
      notes: 'Pit cleaning / vacuum suction job, 4 hrs on site.',
      gaugePhoto: 'SIMULATED',
      companyManName: 'Hank Mireles',
      companyManPhone: 'Radio Ch 6 / (432) 555-0144',
      signature: DEMO_SIG,
      gps: gps(LEASES[2], 30),
      status: 'Synced - Ready to Bill',
      qboInvoiceId: null,
    },
    // ---- Already billed #1 ----
    {
      id: 'tkt-0838',
      ticketNo: 'FT-2026-0838',
      bolNo: 'BOL-884407',
      createdAt: hoursAgo(26),
      driverName: 'Jesse Clawson',
      truckNo: 'Unit #119 - Peterbilt 579 Vac',
      trailerNo: 'Trailer #T-09 - 110 BBL Wichita Vacuum',
      operatorId: 'op-mewbourne',
      leaseId: 'lease-rattlesnake',
      swdId: 'swd-redbluff',
      jobType: 'Produced Water Haul',
      afeNumber: '',
      poNumber: '',
      costCode: 'LOE-8410 Water Hauling',
      tank: { tankNo: 'Tank #4 - 400 BBL Upright', topGauge: "10' 02\"", bottomGauge: "06' 08\"", bswPct: 4.2, netBbls: 110 },
      totalBbls: 110,
      timeArrivedLease: '13:20',
      timeLoaded: '14:05',
      timeArrivedSwd: '15:00',
      timeUnloaded: '15:45',
      standbyHrs: 1.0,
      standbyReason: 'Waiting on SWD Line',
      roustaboutHrs: 0,
      hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
      notes: 'Routine produced water haul.',
      gaugePhoto: 'SIMULATED',
      companyManName: 'Dale Fowler',
      companyManPhone: 'Radio Ch 3 / (432) 555-0177',
      signature: DEMO_SIG,
      gps: gps(LEASES[3], 120),
      status: 'Billed in QuickBooks',
      qboInvoiceId: 'QBO-INV-10938',
    },
    // ---- Already billed #2 ----
    {
      id: 'tkt-0839',
      ticketNo: 'FT-2026-0839',
      bolNo: 'BOL-884408',
      createdAt: hoursAgo(25),
      driverName: 'Marcus DeLeon',
      truckNo: 'Unit #104 - Peterbilt 389 Vac',
      trailerNo: 'Trailer #T-22 - 130 BBL Dragon Vacuum',
      operatorId: 'op-permian',
      leaseId: 'lease-mustang',
      swdId: 'swd-pecos',
      jobType: 'Produced Water Haul',
      afeNumber: 'AFE-4821',
      poNumber: 'PO-99120',
      costCode: 'LOE-8410 Water Hauling',
      tank: { tankNo: 'Tank #2 - 500 BBL Upright', topGauge: "13' 00\"", bottomGauge: "09' 02\"", bswPct: 3.1, netBbls: 125 },
      totalBbls: 125,
      timeArrivedLease: '16:10',
      timeLoaded: '16:55',
      timeArrivedSwd: '17:40',
      timeUnloaded: '18:20',
      standbyHrs: 0.5,
      standbyReason: 'Waiting on SWD Line',
      roustaboutHrs: 0,
      hazard: { jsaCompleted: true, h2sMonitorWorn: true, wheelChocksGroundingSet: true },
      notes: 'Evening haul.',
      gaugePhoto: 'SIMULATED',
      companyManName: 'Cody Jenkins',
      companyManPhone: 'Radio Ch 4 / (432) 555-0188',
      signature: DEMO_SIG,
      gps: gps(LEASES[0], 150),
      status: 'Billed in QuickBooks',
      qboInvoiceId: 'QBO-INV-10939',
    },
  ];
}
