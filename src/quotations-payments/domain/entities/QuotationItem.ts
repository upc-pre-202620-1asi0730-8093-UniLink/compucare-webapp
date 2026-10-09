import { QuotationItemKind } from '../enums/QuotationItemKind'
import { Money } from '../value-objects/Money'

export type QuotationItemProps = {
  id: string
  quotationId: string
  kind: QuotationItemKind
  description: string
  quantity: number
  unitPrice: Money
}

/**
 * Line of a quotation (diagram: QuotationLines).
 * Represents a spare part or additional service with quantity and unit price.
 */
export class QuotationItem {
  readonly id: string
  readonly quotationId: string
  readonly kind: QuotationItemKind
  readonly description: string
  readonly quantity: number
  readonly unitPrice: Money

  private constructor(
    id: string,
    quotationId: string,
    kind: QuotationItemKind,
    description: string,
    quantity: number,
    unitPrice: Money,
  ) {
    this.id = id
    this.quotationId = quotationId
    this.kind = kind
    this.description = description
    this.quantity = quantity
    this.unitPrice = unitPrice
  }

  static create(props: QuotationItemProps): QuotationItem {
    const description = props.description.trim()

    if (!props.id) {
      throw new Error('QuotationItem id is required')
    }

    if (!props.quotationId) {
      throw new Error('QuotationItem quotationId is required')
    }

    if (description.length === 0) {
      throw new Error('QuotationItem description is required')
    }

    if (!Number.isFinite(props.quantity) || props.quantity <= 0) {
      throw new Error('QuotationItem quantity must be greater than zero')
    }

    return new QuotationItem(
      props.id,
      props.quotationId,
      props.kind,
      description,
      props.quantity,
      props.unitPrice,
    )
  }

  /** quantity × unit_price (diagram: subtotal()). */
  subtotal(): Money {
    return this.unitPrice.multiply(this.quantity)
  }
}
