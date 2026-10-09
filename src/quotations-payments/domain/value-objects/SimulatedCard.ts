export type SimulatedCardProps = {
  holderName: string
  number: string
  expiryMonth: number
  expiryYear: number
  cvv: string
}

/**
 * Test card entered for a simulated payment (US-28).
 * Only holderName and last4 leave the client; number and cvv are validated locally.
 */
export class SimulatedCard {
  readonly holderName: string
  readonly last4: string
  readonly expiryMonth: number
  readonly expiryYear: number

  private constructor(
    holderName: string,
    last4: string,
    expiryMonth: number,
    expiryYear: number,
  ) {
    this.holderName = holderName
    this.last4 = last4
    this.expiryMonth = expiryMonth
    this.expiryYear = expiryYear
  }

  static create(props: SimulatedCardProps, now: Date = new Date()): SimulatedCard {
    const holderName = props.holderName.trim()
    const digits = props.number.replace(/[\s-]/g, '')

    if (holderName.length === 0) {
      throw new Error('Card holder name is required')
    }

    if (!/^\d{13,19}$/.test(digits) || !passesLuhn(digits)) {
      throw new Error('Card number is invalid')
    }

    if (!/^\d{3,4}$/.test(props.cvv)) {
      throw new Error('Card CVV must have 3 or 4 digits')
    }

    if (!Number.isInteger(props.expiryMonth) || props.expiryMonth < 1 || props.expiryMonth > 12) {
      throw new Error('Card expiry month must be between 1 and 12')
    }

    if (!Number.isInteger(props.expiryYear) || props.expiryYear < 1000) {
      throw new Error('Card expiry year must have 4 digits')
    }

    const firstDayAfterExpiry = new Date(props.expiryYear, props.expiryMonth, 1)
    if (firstDayAfterExpiry.getTime() <= now.getTime()) {
      throw new Error('Card is expired')
    }

    return new SimulatedCard(holderName, digits.slice(-4), props.expiryMonth, props.expiryYear)
  }
}

function passesLuhn(digits: string): boolean {
  let sum = 0
  let doubleNext = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])

    if (doubleNext) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    doubleNext = !doubleNext
  }

  return sum % 10 === 0
}
