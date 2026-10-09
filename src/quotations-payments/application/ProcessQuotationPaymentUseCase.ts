import { Payment } from '../domain/entities/Payment'
import { QuotationStatus } from '../domain/enums/QuotationStatus'
import { SimulatedCard } from '../domain/value-objects/SimulatedCard'
import type { ProcessQuotationPaymentCommand } from './commands/ProcessQuotationPaymentCommand'
import type { PaymentRepository, ProcessedPayment } from './ports/PaymentRepository'

/**
 * Company admin pays an approved quotation with a simulated card (US-28).
 * The result's payment.status is PAID on success or FAILED if the API declines it.
 */
export class ProcessQuotationPaymentUseCase {
  private readonly payments: PaymentRepository

  constructor(payments: PaymentRepository) {
    this.payments = payments
  }

  async execute(command: ProcessQuotationPaymentCommand): Promise<ProcessedPayment> {
    const { quotation } = command

    if (quotation.status !== QuotationStatus.APPROVED) {
      throw new Error(`Only approved quotations can be paid (current: ${quotation.status})`)
    }

    const amount = quotation.total()
    if (amount.amount <= 0) {
      throw new Error('Cannot pay a quotation with a zero total')
    }

    const card = SimulatedCard.create(command.card)

    const payment = Payment.create({
      id: crypto.randomUUID(),
      companyId: quotation.companyId,
      quotationId: quotation.id,
      amount,
      isSimulated: true,
      idempotencyKey: command.idempotencyKey ?? crypto.randomUUID(),
    })

    const result = await this.payments.processQuotationPayment(payment, card)

    if (result.payment.quotationId !== quotation.id) {
      throw new Error('Payment returned by the API belongs to another quotation')
    }

    return result
  }
}
