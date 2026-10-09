/**
 * Response from POST /api/v1/quotations (201 Created).
 */
export type QuotationItemResponseDto = {
  id: string
  quotationId: string
  kind: string
  description: string
  quantity: number
  unitPrice: number
}

export type QuotationResponseDto = {
  id: string
  requestId: string
  companyId: string
  version: number
  status: string
  currency: string
  validUntil: string
  decidedBy: string | null
  decidedAt: string | null
  items: QuotationItemResponseDto[]
}
