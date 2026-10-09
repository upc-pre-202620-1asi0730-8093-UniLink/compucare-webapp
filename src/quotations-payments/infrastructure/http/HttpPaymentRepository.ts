import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import type { PaymentRepository, ProcessedPayment } from '../../application/ports/PaymentRepository'
import type { Payment } from '../../domain/entities/Payment'
import type { SimulatedCard } from '../../domain/value-objects/SimulatedCard'
import type { PaymentResponseDto } from './dtos/PaymentResponseDto'
import { PaymentMapper } from './mappers/PaymentMapper'

const QUOTATIONS_PATH = '/api/v1/quotations'

/**
 * Infrastructure adapter for simulated quotation payments.
 */
export class HttpPaymentRepository implements PaymentRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async processQuotationPayment(payment: Payment, card: SimulatedCard): Promise<ProcessedPayment> {
    if (!payment.quotationId) {
      throw new Error('Payment must reference a quotation to be processed')
    }

    const path = `${QUOTATIONS_PATH}/${encodeURIComponent(payment.quotationId)}/payments`
    const request = PaymentMapper.toProcessRequest(payment, card)
    const response = await this.http.post<PaymentResponseDto>(path, request)

    if (!response || !response.id) {
      throw new Error('POST /api/v1/quotations/{id}/payments did not return a payment body')
    }

    return PaymentMapper.toProcessedPayment(response)
  }
}
