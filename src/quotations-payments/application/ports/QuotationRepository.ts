import type { Quotation } from '../../domain/entities/Quotation'
import type { QuotationDecision } from '../../domain/enums/QuotationDecision'

/**
 * Port for persisting and retrieving quotations.
 */
export interface QuotationRepository {
  create(quotation: Quotation): Promise<Quotation>
  changeStatus(quotationId: string, status: QuotationDecision): Promise<Quotation>
}
