import { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import { ChangeQuotationStatusUseCase } from '../../application/ChangeQuotationStatusUseCase'
import { CreateQuotationUseCase } from '../../application/CreateQuotationUseCase'
import { HttpQuotationRepository } from '../http/HttpQuotationRepository'

export type QuotationModule = {
  createQuotation: CreateQuotationUseCase
  changeQuotationStatus: ChangeQuotationStatusUseCase
}

/**
 * Wires application + HTTP infrastructure for quotations.
 */
export function createQuotationModule(httpClient?: HttpClient): QuotationModule {
  const http = httpClient ?? new HttpClient()
  const quotations = new HttpQuotationRepository(http)

  return {
    createQuotation: new CreateQuotationUseCase(quotations),
    changeQuotationStatus: new ChangeQuotationStatusUseCase(quotations),
  }
}
