import type { Quotation } from '../domain/entities/Quotation'
import type { QuotationListFilters, QuotationRepository } from './ports/QuotationRepository'

/**
 * Lists the company's quotations, optionally filtered by status, request or decision date.
 * The company is resolved by the API from the JWT.
 */
export class ListQuotationsUseCase {
  private readonly quotations: QuotationRepository

  constructor(quotations: QuotationRepository) {
    this.quotations = quotations
  }

  async execute(filters: QuotationListFilters = {}): Promise<Quotation[]> {
    const { decidedFrom, decidedTo } = filters

    if (decidedFrom && Number.isNaN(decidedFrom.getTime())) {
      throw new Error('decidedFrom must be a valid date')
    }

    if (decidedTo && Number.isNaN(decidedTo.getTime())) {
      throw new Error('decidedTo must be a valid date')
    }

    if (decidedFrom && decidedTo && decidedFrom.getTime() >= decidedTo.getTime()) {
      throw new Error('decidedFrom must be earlier than decidedTo')
    }

    return this.quotations.list(filters)
  }
}
