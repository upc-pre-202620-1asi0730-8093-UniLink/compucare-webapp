import type { Quotation } from '../../domain/entities/Quotation'
import type { QuotationDecision } from '../../domain/enums/QuotationDecision'
import type { QuotationStatus } from '../../domain/enums/QuotationStatus'

/**
 * decidedFrom is inclusive and decidedTo is exclusive.
 */
export type QuotationListFilters = {
  status?: QuotationStatus
  requestId?: string
  decidedFrom?: Date
  decidedTo?: Date
}

/**
 * Port for persisting and retrieving quotations.
 */
export interface QuotationRepository {
  create(quotation: Quotation): Promise<Quotation>
  changeStatus(quotationId: string, status: QuotationDecision): Promise<Quotation>
  list(filters: QuotationListFilters): Promise<Quotation[]>
}
