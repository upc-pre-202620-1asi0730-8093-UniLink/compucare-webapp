import { Currency } from './Currency'

/**
 * Monetary amount with currency.
 * Used by QuotationItem unit prices and Payment amounts.
 */
export class Money {
  readonly amount: number
  readonly currency: Currency

  private constructor(amount: number, currency: Currency) {
    this.amount = amount
    this.currency = currency
  }

  static create(amount: number, currency: Currency | string): Money {
    if (!Number.isFinite(amount)) {
      throw new Error('Money amount must be a finite number')
    }

    if (amount < 0) {
      throw new Error('Money amount cannot be negative')
    }

    const resolvedCurrency =
      typeof currency === 'string' ? Currency.create(currency) : currency

    return new Money(amount, resolvedCurrency)
  }

  static zero(currency: Currency | string): Money {
    return Money.create(0, currency)
  }

  add(other: Money): Money {
    this.assertSameCurrency(other)
    return Money.create(this.amount + other.amount, this.currency)
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new Error('Money multiply factor must be a non-negative finite number')
    }

    return Money.create(this.amount * factor, this.currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency)
  }

  private assertSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency)) {
      throw new Error(
        `Currency mismatch: ${this.currency.code} vs ${other.currency.code}`,
      )
    }
  }
}
