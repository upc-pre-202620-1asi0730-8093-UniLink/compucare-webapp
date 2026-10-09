import type { Quotation } from '../domain/entities/Quotation'
import { isQuotationDecision } from '../domain/enums/QuotationDecision'
import type { ChangeQuotationStatusCommand } from './commands/ChangeQuotationStatusCommand'
import type { QuotationRepository } from './ports/QuotationRepository'

/**
 * Company admin digitally approves or rejects a pending quotation (US-26 / US-30).
 */
export class ChangeQuotationStatusUseCase {
  private readonly quotations: QuotationRepository

  constructor(quotations: QuotationRepository) {
    this.quotations = quotations
  }

  async execute(command: ChangeQuotationStatusCommand): Promise<Quotation> {
    if (!command.quotationId?.trim()) {
      throw new Error('quotationId is required')
    }

    if (!isQuotationDecision(command.status)) {
      throw new Error('status must be APPROVED or REJECTED')
    }

    const quotation = await this.quotations.changeStatus(command.quotationId, command.status)

    if (quotation.status !== command.status) {
      throw new Error(
        `Quotation ${quotation.id} is ${quotation.status} after requesting ${command.status}`,
      )
    }

    return quotation
  }
}
