import type { ProcessedPayment } from '../../../application/ports/PaymentRepository'
import { Payment } from '../../../domain/entities/Payment'
import { PaymentStatus } from '../../../domain/enums/PaymentStatus'
import type { SimulatedCard } from '../../../domain/value-objects/SimulatedCard'
import type { PaymentResponseDto } from '../dtos/PaymentResponseDto'
import type { ProcessQuotationPaymentRequestDto } from '../dtos/ProcessQuotationPaymentRequestDto'

const paymentStatuses = new Set<string>(Object.values(PaymentStatus))

export const PaymentMapper = {
  toProcessRequest(payment: Payment, card: SimulatedCard): ProcessQuotationPaymentRequestDto {
    return {
      amount: payment.amount.amount,
      currency: payment.currency.code,
      idempotencyKey: payment.idempotencyKey.value,
      isSimulated: payment.isSimulated,
      card: {
        holderName: card.holderName,
        last4: card.last4,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
      },
    }
  },

  toProcessedPayment(dto: PaymentResponseDto): ProcessedPayment {
    const payment = Payment.create({
      id: dto.id,
      companyId: dto.companyId,
      periodId: dto.periodId,
      quotationId: dto.quotationId,
      amount: { amount: dto.amount, currency: dto.currency },
      status: parsePaymentStatus(dto.status),
      isSimulated: dto.isSimulated,
      idempotencyKey: dto.idempotencyKey,
    })

    const receipt =
      dto.receiptNumber && dto.paidAt
        ? { number: dto.receiptNumber, issuedAt: new Date(dto.paidAt) }
        : null

    return { payment, receipt }
  },
}

function parsePaymentStatus(value: string): PaymentStatus {
  if (!paymentStatuses.has(value)) {
    throw new Error(`Unknown payment status from API: ${value}`)
  }

  return value as PaymentStatus
}
