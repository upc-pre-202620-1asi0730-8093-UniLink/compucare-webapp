/**
 * Lifecycle of a quotation (BC05).
 * Aligns with US-25 / US-26 / US-30 and the class diagram send/approve/reject flow.
 */
export const QuotationStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const

export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus]
