/**
 * Query string for GET /api/v1/quotations.
 * Dates are ISO 8601; decidedFrom is inclusive and decidedTo is exclusive.
 */
export type ListQuotationsQueryDto = {
  status?: string
  requestId?: string
  decidedFrom?: string
  decidedTo?: string
}
