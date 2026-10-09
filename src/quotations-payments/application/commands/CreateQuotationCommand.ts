import type { QuotationItemKind } from '../../domain/enums/QuotationItemKind'

export type CreateQuotationItemCommand = {
  kind: QuotationItemKind
  description: string
  quantity: number
  unitPrice: number
}

/**
 * Input for a technician issuing a spare-parts quotation (US-25).
 */
export type CreateQuotationCommand = {
  requestId: string
  companyId: string
  currency: string
  validUntil: Date | string
  items: CreateQuotationItemCommand[]
}
