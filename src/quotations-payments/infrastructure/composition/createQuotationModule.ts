import { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import { ChangeQuotationStatusUseCase } from '../../application/ChangeQuotationStatusUseCase'
import { CreateQuotationUseCase } from '../../application/CreateQuotationUseCase'
import { GetMonthlyExpenseReportUseCase } from '../../application/GetMonthlyExpenseReportUseCase'
import { ListQuotationsUseCase } from '../../application/ListQuotationsUseCase'
import { ProcessQuotationPaymentUseCase } from '../../application/ProcessQuotationPaymentUseCase'
import { HttpPaymentRepository } from '../http/HttpPaymentRepository'
import { HttpQuotationRepository } from '../http/HttpQuotationRepository'

export type QuotationModule = {
  createQuotation: CreateQuotationUseCase
  changeQuotationStatus: ChangeQuotationStatusUseCase
  processQuotationPayment: ProcessQuotationPaymentUseCase
  listQuotations: ListQuotationsUseCase
  getMonthlyExpenseReport: GetMonthlyExpenseReportUseCase
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
    listQuotations: new ListQuotationsUseCase(quotations),
    getMonthlyExpenseReport: new GetMonthlyExpenseReportUseCase(quotations),
  }
}
