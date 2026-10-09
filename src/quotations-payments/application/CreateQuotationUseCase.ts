import { Quotation } from '../domain/entities/Quotation'
import { QuotationItem } from '../domain/entities/QuotationItem'
import { Money } from '../domain/value-objects/Money'
import type { CreateQuotationCommand } from './commands/CreateQuotationCommand'
import type { QuotationRepository } from './ports/QuotationRepository'

/**
 * Technician creates and emits a quotation so it becomes PENDING_APPROVAL (US-25).
 */
export class CreateQuotationUseCase {
  private readonly quotations: QuotationRepository

  constructor(quotations: QuotationRepository) {
    this.quotations = quotations
  }

  async execute(command: CreateQuotationCommand): Promise<Quotation> {
    if (!command.requestId?.trim()) {
      throw new Error('requestId is required')
    }

    if (!command.companyId?.trim()) {
      throw new Error('companyId is required')
    }

    if (!command.items || command.items.length === 0) {
      throw new Error('A quotation must include at least one item')
    }

    const quotationId = crypto.randomUUID()
    const validUntil =
      command.validUntil instanceof Date
        ? command.validUntil
        : new Date(command.validUntil)

    if (Number.isNaN(validUntil.getTime())) {
      throw new Error('validUntil must be a valid date')
    }

    const items = command.items.map((item) =>
      QuotationItem.create({
        id: crypto.randomUUID(),
        quotationId,
        kind: item.kind,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Money.create(item.unitPrice, command.currency),
      }),
    )

    const quotation = Quotation.create({
      id: quotationId,
      requestId: command.requestId,
      companyId: command.companyId,
      currency: command.currency,
      validUntil,
      items,
    })

    quotation.send()

    return this.quotations.create(quotation)
  }
}
