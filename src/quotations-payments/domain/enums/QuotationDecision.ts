import { QuotationStatus } from './QuotationStatus'

/**
 * Statuses a company admin can set on a pending quotation (US-26 / US-30).
 */
export const QuotationDecision = {
  APPROVED: QuotationStatus.APPROVED,
  REJECTED: QuotationStatus.REJECTED,
} as const

export type QuotationDecision = (typeof QuotationDecision)[keyof typeof QuotationDecision]

const decisions = new Set<string>(Object.values(QuotationDecision))

export function isQuotationDecision(value: string): value is QuotationDecision {
  return decisions.has(value)
}
