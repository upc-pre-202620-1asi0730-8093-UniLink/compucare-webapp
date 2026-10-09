/**
 * Unique key that prevents duplicate payment processing (UNIQUE in BC05 DB).
 */
export class IdempotencyKey {
  readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string): IdempotencyKey {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      throw new Error('Idempotency key cannot be empty')
    }

    if (trimmed.length > 128) {
      throw new Error('Idempotency key cannot exceed 128 characters')
    }

    return new IdempotencyKey(trimmed)
  }

  equals(other: IdempotencyKey): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
