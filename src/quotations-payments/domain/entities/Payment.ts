import { PaymentStatus } from '../enums/PaymentStatus'
import { Currency } from '../value-objects/Currency'
import { IdempotencyKey } from '../value-objects/IdempotencyKey'
import { Money } from '../value-objects/Money'

export type PaymentProps = {
  id: string
  companyId: string
  amount: Money | { amount: number; currency: Currency | string }
  status?: PaymentStatus
  isSimulated?: boolean
  idempotencyKey: IdempotencyKey | string
  periodId?: string | null
  quotationId?: string | null
}

/**
 * Payment for an approved quotation or subscription period (BC05).
 * Cross-BC refs: companyId → BC02, periodId? → BC03, quotationId? → Quotation.
 */
export class Payment {
  readonly id: string
  readonly companyId: string
  readonly periodId: string | null
  readonly quotationId: string | null
  readonly amount: Money
  readonly isSimulated: boolean
  readonly idempotencyKey: IdempotencyKey

  private _status: PaymentStatus

  private constructor(
    id: string,
    companyId: string,
    periodId: string | null,
    quotationId: string | null,
    amount: Money,
    status: PaymentStatus,
    isSimulated: boolean,
    idempotencyKey: IdempotencyKey,
  ) {
    this.id = id
    this.companyId = companyId
    this.periodId = periodId
    this.quotationId = quotationId
    this.amount = amount
    this.isSimulated = isSimulated
    this.idempotencyKey = idempotencyKey
    this._status = status
  }

  static create(props: PaymentProps): Payment {
    if (!props.id) {
      throw new Error('Payment id is required')
    }

    if (!props.companyId) {
      throw new Error('Payment companyId is required')
    }

    const amount =
      props.amount instanceof Money
        ? props.amount
        : Money.create(props.amount.amount, props.amount.currency)

    const idempotencyKey =
      props.idempotencyKey instanceof IdempotencyKey
        ? props.idempotencyKey
        : IdempotencyKey.create(props.idempotencyKey)

    const periodId = props.periodId ?? null
    const quotationId = props.quotationId ?? null

    if (periodId === null && quotationId === null) {
      throw new Error('Payment must reference a periodId and/or quotationId')
    }

    return new Payment(
      props.id,
      props.companyId,
      periodId,
      quotationId,
      amount,
      props.status ?? PaymentStatus.PENDING,
      props.isSimulated ?? true,
      idempotencyKey,
    )
  }

  get status(): PaymentStatus {
    return this._status
  }

  get currency(): Currency {
    return this.amount.currency
  }

  /**
   * Confirms a simulated card payment and marks it as paid (US-28 / diagram).
   */
  confirmSimulation(): void {
    if (!this.isSimulated) {
      throw new Error('Only simulated payments can be confirmed via confirmSimulation')
    }

    if (this._status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot confirm payment in status ${this._status}`)
    }

    this._status = PaymentStatus.PAID
  }

  markFailed(): void {
    if (this._status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot fail payment in status ${this._status}`)
    }

    this._status = PaymentStatus.FAILED
  }
}
