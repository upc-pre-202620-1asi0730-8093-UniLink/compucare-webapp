import type { Payment } from '../../domain/entities/Payment'
import type { SimulatedCard } from '../../domain/value-objects/SimulatedCard'

export type PaymentReceipt = {
  number: string
  issuedAt: Date
}

export type ProcessedPayment = {
  payment: Payment
  receipt: PaymentReceipt | null
}

/**
 * Port for processing payments of approved quotations.
 */
export interface PaymentRepository {
  processQuotationPayment(payment: Payment, card: SimulatedCard): Promise<ProcessedPayment>
}
