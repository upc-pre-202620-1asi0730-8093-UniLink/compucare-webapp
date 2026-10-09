import { QuotationStatus } from '../domain/enums/QuotationStatus'
import type { Money } from '../domain/value-objects/Money'
import type { QuotationRepository } from './ports/QuotationRepository'
import type {
  ExpenseReportLine,
  MonthlyExpenseReport,
  MonthlyExpenseReportQuery,
} from './queries/MonthlyExpenseReport'

/**
 * Builds the monthly breakdown of approved quotations for auditing extra spend (US-27).
 */
export class GetMonthlyExpenseReportUseCase {
  private readonly quotations: QuotationRepository

  constructor(quotations: QuotationRepository) {
    this.quotations = quotations
  }

  async execute(query: MonthlyExpenseReportQuery): Promise<MonthlyExpenseReport> {
    const { year, month } = query

    if (!Number.isInteger(year) || year < 1000) {
      throw new Error('year must have 4 digits')
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('month must be between 1 and 12')
    }

    const approved = await this.quotations.list({
      status: QuotationStatus.APPROVED,
      decidedFrom: new Date(year, month - 1, 1),
      decidedTo: new Date(year, month, 1),
    })

    const lines: ExpenseReportLine[] = approved.flatMap((quotation) =>
      quotation.items.map((item) => ({
        quotationId: quotation.id,
        requestId: quotation.requestId,
        decidedAt: quotation.decidedAt,
        kind: item.kind,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal(),
      })),
    )

    const totalsByCurrency = new Map<string, Money>()
    for (const quotation of approved) {
      const total = quotation.total()
      const current = totalsByCurrency.get(total.currency.code)
      totalsByCurrency.set(total.currency.code, current ? current.add(total) : total)
    }

    return {
      year,
      month,
      quotationCount: approved.length,
      lines,
      totals: [...totalsByCurrency.values()],
    }
  }
}
