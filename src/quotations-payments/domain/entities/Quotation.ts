import { QuotationStatus } from '../enums/QuotationStatus'
import { Currency } from '../value-objects/Currency'
import { Money } from '../value-objects/Money'
import { QuotationItem } from './QuotationItem'

export type QuotationProps = {
  id: string
  requestId: string
  companyId: string
  version?: number
  status?: QuotationStatus
  currency: Currency | string
  validUntil: Date
  decidedBy?: string | null
  decidedAt?: Date | null
  items?: QuotationItem[]
}

/**
 * Aggregate root for a spare-parts / extra-services quotation (BC05).
 * Cross-BC refs: requestId → BC04, companyId → BC02, decidedBy → BC01.
 */
export class Quotation {
  readonly id: string
  readonly requestId: string
  readonly companyId: string
  readonly version: number
  readonly currency: Currency
  readonly validUntil: Date

  private _status: QuotationStatus
  private _decidedBy: string | null
  private _decidedAt: Date | null
  private readonly _items: QuotationItem[]

  private constructor(
    id: string,
    requestId: string,
    companyId: string,
    version: number,
    status: QuotationStatus,
    currency: Currency,
    validUntil: Date,
    decidedBy: string | null,
    decidedAt: Date | null,
    items: QuotationItem[],
  ) {
    this.id = id
    this.requestId = requestId
    this.companyId = companyId
    this.version = version
    this.currency = currency
    this.validUntil = validUntil
    this._status = status
    this._decidedBy = decidedBy
    this._decidedAt = decidedAt
    this._items = [...items]
  }

  static create(props: QuotationProps): Quotation {
    if (!props.id) {
      throw new Error('Quotation id is required')
    }

    if (!props.requestId) {
      throw new Error('Quotation requestId is required')
    }

    if (!props.companyId) {
      throw new Error('Quotation companyId is required')
    }

    if (!(props.validUntil instanceof Date) || Number.isNaN(props.validUntil.getTime())) {
      throw new Error('Quotation validUntil must be a valid date')
    }

    const currency =
      typeof props.currency === 'string'
        ? Currency.create(props.currency)
        : props.currency

    const items = props.items ?? []
    for (const item of items) {
      if (item.quotationId !== props.id) {
        throw new Error('QuotationItem.quotationId must match Quotation.id')
      }

      if (!item.unitPrice.currency.equals(currency)) {
        throw new Error('QuotationItem currency must match Quotation currency')
      }
    }

    return new Quotation(
      props.id,
      props.requestId,
      props.companyId,
      props.version ?? 1,
      props.status ?? QuotationStatus.DRAFT,
      currency,
      props.validUntil,
      props.decidedBy ?? null,
      props.decidedAt ?? null,
      items,
    )
  }

  get status(): QuotationStatus {
    return this._status
  }

  get decidedBy(): string | null {
    return this._decidedBy
  }

  get decidedAt(): Date | null {
    return this._decidedAt
  }

  get items(): readonly QuotationItem[] {
    return this._items
  }

  total(): Money {
    if (this._items.length === 0) {
      return Money.zero(this.currency)
    }

    return this._items
      .map((item) => item.subtotal())
      .reduce((acc, current) => acc.add(current))
  }

  addItem(item: QuotationItem): void {
    this.assertEditable()

    if (item.quotationId !== this.id) {
      throw new Error('QuotationItem.quotationId must match Quotation.id')
    }

    if (!item.unitPrice.currency.equals(this.currency)) {
      throw new Error('QuotationItem currency must match Quotation currency')
    }

    this._items.push(item)
  }

  /** Moves draft quotation to pending approval (US-25). */
  send(): void {
    if (this._status !== QuotationStatus.DRAFT) {
      throw new Error(`Cannot send quotation in status ${this._status}`)
    }

    if (this._items.length === 0) {
      throw new Error('Cannot send a quotation without items')
    }

    if (this.validUntil.getTime() < Date.now()) {
      throw new Error('Cannot send an expired quotation')
    }

    this._status = QuotationStatus.PENDING_APPROVAL
  }

  /** Company admin approves purchase (US-26 / US-30). */
  approve(decidedBy: string, decidedAt: Date = new Date()): void {
    if (this._status !== QuotationStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot approve quotation in status ${this._status}`)
    }

    if (!decidedBy) {
      throw new Error('decidedBy is required to approve a quotation')
    }

    this._status = QuotationStatus.APPROVED
    this._decidedBy = decidedBy
    this._decidedAt = decidedAt
  }

  /** Company admin rejects purchase (US-26 / US-30). */
  reject(decidedBy: string, decidedAt: Date = new Date()): void {
    if (this._status !== QuotationStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot reject quotation in status ${this._status}`)
    }

    if (!decidedBy) {
      throw new Error('decidedBy is required to reject a quotation')
    }

    this._status = QuotationStatus.REJECTED
    this._decidedBy = decidedBy
    this._decidedAt = decidedAt
  }

  private assertEditable(): void {
    if (this._status !== QuotationStatus.DRAFT) {
      throw new Error('Only draft quotations can be modified')
    }
  }
}
