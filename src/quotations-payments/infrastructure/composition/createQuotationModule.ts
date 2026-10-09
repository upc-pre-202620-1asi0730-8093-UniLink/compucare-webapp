import { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import { ChangeQuotationStatusUseCase } from '../../application/ChangeQuotationStatusUseCase'
import { CreateQuotationUseCase } from '../../application/CreateQuotationUseCase'
import { GetMonthlyExpenseReportUseCase } from '../../application/GetMonthlyExpenseReportUseCase'
import { ListQuotationsUseCase } from '../../application/ListQuotationsUseCase'
import { ProcessQuotationPaymentUseCase } from '../../application/ProcessQuotationPaymentUseCase'
import type { PaymentRepository } from '../../application/ports/PaymentRepository'
import type { QuotationRepository } from '../../application/ports/QuotationRepository'
import { HttpPaymentRepository } from '../http/HttpPaymentRepository'
import { HttpQuotationRepository } from '../http/HttpQuotationRepository'
import { DEMO_ADMIN_ID } from '../in-memory/demoIdentity'
import { InMemoryPaymentRepository } from '../in-memory/InMemoryPaymentRepository'
import { InMemoryQuotationRepository } from '../in-memory/InMemoryQuotationRepository'
import { seedQuotations } from '../in-memory/seedQuotations'

export type QuotationModule = {
  createQuotation: CreateQuotationUseCase
  changeQuotationStatus: ChangeQuotationStatusUseCase
  processQuotationPayment: ProcessQuotationPaymentUseCase
  listQuotations: ListQuotationsUseCase
  getMonthlyExpenseReport: GetMonthlyExpenseReportUseCase
}

export function buildQuotationModule(
  quotations: QuotationRepository,
  payments: PaymentRepository,
): QuotationModule {
  return {
    createQuotation: new CreateQuotationUseCase(quotations),
    changeQuotationStatus: new ChangeQuotationStatusUseCase(quotations),
    processQuotationPayment: new ProcessQuotationPaymentUseCase(payments),
    listQuotations: new ListQuotationsUseCase(quotations),
    getMonthlyExpenseReport: new GetMonthlyExpenseReportUseCase(quotations),
  }
}

/**
 * Wires application + HTTP infrastructure for quotations and payments.
 */
export function createQuotationModule(httpClient?: HttpClient): QuotationModule {
  const http = httpClient ?? new HttpClient()
  return buildQuotationModule(new HttpQuotationRepository(http), new HttpPaymentRepository(http))
}

/**
 * Same use cases backed by in-memory repositories with demo data.
 */
export function createInMemoryQuotationModule(): QuotationModule {
  return buildQuotationModule(
    new InMemoryQuotationRepository(seedQuotations(), DEMO_ADMIN_ID),
    new InMemoryPaymentRepository(),
  )
}
