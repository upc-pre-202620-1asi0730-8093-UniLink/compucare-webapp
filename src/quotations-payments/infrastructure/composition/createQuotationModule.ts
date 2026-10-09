import { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import { CreateQuotationUseCase } from '../../application/CreateQuotationUseCase'
import { HttpQuotationRepository } from '../http/HttpQuotationRepository'

export type QuotationModule = {
  createQuotation: CreateQuotationUseCase
}

/**
 * Wires application + HTTP infrastructure for quotation creation.
 */
export function createQuotationModule(httpClient?: HttpClient): QuotationModule {
  const http = httpClient ?? new HttpClient()
  const quotations = new HttpQuotationRepository(http)

  return {
    createQuotation: new CreateQuotationUseCase(quotations),
  }
}
