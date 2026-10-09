import type { QuotationItemKind } from '../../domain/enums/QuotationItemKind'
import type { Money } from '../../domain/value-objects/Money'

export type MonthlyExpenseReportQuery = {
  year: number
  /** 1 = January … 12 = December */
  month: number
}

export type ExpenseReportLine = {
  quotationId: string
  requestId: string
  decidedAt: Date | null
  kind: QuotationItemKind
  description: string
  quantity: number
  unitPrice: Money
  subtotal: Money
}

/**
 * Consolidated approved spare parts and extra services for one month (US-27).
 * totals has one entry per currency used in the month.
 */
export type MonthlyExpenseReport = {
  year: number
  month: number
  quotationCount: number
  lines: ExpenseReportLine[]
  totals: Money[]
}
