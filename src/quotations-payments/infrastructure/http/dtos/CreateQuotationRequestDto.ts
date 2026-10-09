/**
 * Body for POST /api/v1/quotations
 */
export type CreateQuotationItemRequestDto = {
  kind: string
  description: string
  quantity: number
  unitPrice: number
}

export type CreateQuotationRequestDto = {
  requestId: string
  companyId: string
  currency: string
  validUntil: string
  /** After send(): PENDING_APPROVAL (US-25 emit). */
  status: string
  items: CreateQuotationItemRequestDto[]
}
