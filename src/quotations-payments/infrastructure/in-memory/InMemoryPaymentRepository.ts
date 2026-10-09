import type { PaymentRepository, ProcessedPayment } from '../../application/ports/PaymentRepository'
import type { Payment } from '../../domain/entities/Payment'
import type { SimulatedCard } from '../../domain/value-objects/SimulatedCard'
import { simulateLatency } from './simulateLatency'

/** Test card 4000 0000 0000 0002 is always declined. */
export const DECLINED_TEST_CARD_LAST4 = '0002'

/**
 * In-memory adapter for simulated payments while the API is not available.
 */
export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly byIdempotencyKey = new Map<string, ProcessedPayment>()
  private readonly paidQuotationIds = new Set<string>()
  private receiptSequence = 1

  async processQuotationPayment(payment: Payment, card: SimulatedCard): Promise<ProcessedPayment> {
    await simulateLatency(700)

    const previous = this.byIdempotencyKey.get(payment.idempotencyKey.value)
    if (previous) {
      return previous
    }

    if (!payment.quotationId) {
      throw new Error('Payment must reference a quotation to be processed')
    }

    if (this.paidQuotationIds.has(payment.quotationId)) {
      throw new Error('This quotation has already been paid')
    }

    let result: ProcessedPayment

    if (card.last4 === DECLINED_TEST_CARD_LAST4) {
      payment.markFailed()
      result = { payment, receipt: null }
    } else {
      payment.confirmSimulation()
      this.paidQuotationIds.add(payment.quotationId)
      result = {
        payment,
        receipt: { number: this.nextReceiptNumber(), issuedAt: new Date() },
      }
    }

    this.byIdempotencyKey.set(payment.idempotencyKey.value, result)
    return result
  }

  private nextReceiptNumber(): string {
    const sequence = String(this.receiptSequence++).padStart(6, '0')
    return `CC-${new Date().getFullYear()}-${sequence}`
  }
}
