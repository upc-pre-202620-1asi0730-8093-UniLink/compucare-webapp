/**
 * Line item kind for spare parts or extra services (US-25).
 */
export const QuotationItemKind = {
  SPARE_PART: 'SPARE_PART',
  ADDITIONAL_SERVICE: 'ADDITIONAL_SERVICE',
} as const

export type QuotationItemKind =
  (typeof QuotationItemKind)[keyof typeof QuotationItemKind]
