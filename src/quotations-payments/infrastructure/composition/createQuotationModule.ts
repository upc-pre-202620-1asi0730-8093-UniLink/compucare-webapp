import { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import { ChangeQuotationStatusUseCase } from '../../application/ChangeQuotationStatusUseCase'
import { CreateQuotationUseCase } from '../../application/CreateQuotationUseCase'
import { ProcessQuotationPaymentUseCase } from '../../application/ProcessQuotationPaymentUseCase'
import { HttpPaymentRepository } from '../http/HttpPaymentRepository'
import { HttpQuotationRepository } from '../http/HttpQuotationRepository'

export type QuotationModule = {
  createQuotation: CreateQuotationUseCase
  changeQuotationStatus: ChangeQuotationStatusUseCase
  processQuotationPayment: ProcessQuotationPaymentUseCase
}

/**
 * Wires application + HTTP infrastructure for quotations and payments.
 */
export function createQuotationModule(httpClient?: HttpClient): QuotationModule {
  const http = httpClient ?? new HttpClient()
  const quotations = new HttpQuotationRepository(http)
  const payments = new HttpPaymentRepository(http)

  return {
    createQuotation: new CreateQuotationUseCase(quotations),
    changeQuotationStatus: new ChangeQuotationStatusUseCase(quotations),
    processQuotationPayment: new ProcessQuotationPaymentUseCase(payments),
  }
}
