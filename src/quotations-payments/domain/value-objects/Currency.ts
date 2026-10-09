/**
 * ISO 4217 currency code (CHAR(3) in the BC05 diagram).
 */
export class Currency {
  readonly code: string

  private constructor(code: string) {
    this.code = code
  }

  static create(code: string): Currency {
    const normalized = code.trim().toUpperCase()

    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new Error('Currency must be a 3-letter ISO 4217 code')
    }

    return new Currency(normalized)
  }

  equals(other: Currency): boolean {
    return this.code === other.code
  }

  toString(): string {
    return this.code
  }
}
