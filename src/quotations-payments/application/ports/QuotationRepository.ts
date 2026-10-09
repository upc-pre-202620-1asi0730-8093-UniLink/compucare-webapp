import type { Quotation } from '../../domain/entities/Quotation'

/**
 * Port for persisting and retrieving quotations.
 * Implemented by HTTP infrastructure against POST /api/v1/quotations.
 */
export interface QuotationRepository {
  create(quotation: Quotation): Promise<Quotation>
}
