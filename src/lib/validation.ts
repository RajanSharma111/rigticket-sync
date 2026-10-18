// ============================================================================
// Smart Billing Guardrail — compliance code validation
// ============================================================================
import type { BillingRuleCode, FieldTicket, Operator } from '../types';

export interface RuleResult {
  code: BillingRuleCode;
  label: string;
  satisfied: boolean;
  detail: string;
}

export function codeLabel(code: BillingRuleCode): string {
  switch (code) {
    case 'AFE':
      return 'AFE #';
    case 'PO':
      return 'PO # / Work Order #';
    case 'CostCode':
      return 'Cost Code / LOE Code';
  }
}

export function evaluateRules(ticket: FieldTicket, operator: Operator): RuleResult[] {
  return operator.requiredCodes.map((code) => {
    switch (code) {
      case 'AFE': {
        const ok = /^AFE-\d{3,}$/i.test(ticket.afeNumber.trim());
        return {
          code,
          label: codeLabel(code),
          satisfied: ok,
          detail: 'Format: AFE-XXXX',
        };
      }
      case 'PO': {
        const ok = ticket.poNumber.trim().length >= 3;
        return { code, label: codeLabel(code), satisfied: ok, detail: 'Required by Operator' };
      }
      case 'CostCode': {
        const ok = ticket.costCode.trim().length >= 3;
        return { code, label: codeLabel(code), satisfied: ok, detail: 'e.g. LOE-8410' };
      }
    }
  });
}

export function allRulesSatisfied(ticket: FieldTicket, operator: Operator): boolean {
  return evaluateRules(ticket, operator).every((r) => r.satisfied);
}
