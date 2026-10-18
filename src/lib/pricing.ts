// ============================================================================
// Automated Rate Sheet & Pricing Engine
// ============================================================================
import type { FieldTicket, Operator, RateBreakdown } from '../types';

export function computeBreakdown(ticket: FieldTicket, operator: Operator): RateBreakdown {
  const rs = operator.rateSheet;
  let haulLabel = '';
  let haulQty = 0;
  let haulUnit: 'BBL' | 'hr' = 'BBL';
  let haulRate = 0;

  switch (ticket.jobType) {
    case 'Produced Water Haul':
      haulLabel = 'Produced Water Haul';
      haulQty = ticket.totalBbls;
      haulUnit = 'BBL';
      haulRate = rs.producedWaterPerBbl ?? 0;
      break;
    case 'Fresh Water Haul':
      haulLabel = 'Fresh Water Haul';
      haulQty = ticket.totalBbls;
      haulUnit = 'BBL';
      haulRate = rs.freshWaterPerBbl ?? 0;
      break;
    case 'Flowback / Pit Cleaning':
      haulLabel = 'Vacuum / Pit Cleaning';
      haulQty = ticket.roustaboutHrs;
      haulUnit = 'hr';
      haulRate = rs.vacuumPerHr ?? 0;
      break;
    case 'Roustabout Crew Labor':
      haulLabel = 'Roustabout Crew Labor';
      haulQty = ticket.roustaboutHrs;
      haulUnit = 'hr';
      haulRate = rs.roustaboutPerHr ?? 0;
      break;
    case 'Hot-Shot Freight':
      haulLabel = 'Hot-Shot Freight';
      haulQty = ticket.roustaboutHrs;
      haulUnit = 'hr';
      haulRate = rs.roustaboutPerHr ?? 0;
      break;
  }

  const haulCharge = round2(haulQty * haulRate);
  const standbyRate = rs.standbyPerHr;
  const standbyCharge = round2(ticket.standbyHrs * standbyRate);
  const subtotal = haulCharge + standbyCharge;
  const fuelSurcharge = round2(subtotal * rs.fuelSurchargePct);
  const total = round2(subtotal + fuelSurcharge);

  return {
    haulLabel,
    haulQty,
    haulUnit,
    haulRate,
    haulCharge,
    standbyHrs: ticket.standbyHrs,
    standbyRate,
    standbyCharge,
    fuelSurchargePct: rs.fuelSurchargePct,
    fuelSurcharge,
    total,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function money(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
