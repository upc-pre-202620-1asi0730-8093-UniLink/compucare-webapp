import type { Quotation } from '../../domain/entities/Quotation'
import type { SimulatedCardProps } from '../../domain/value-objects/SimulatedCard'

/**
 * Input for a company admin paying an approved quotation with a test card (US-28).
 * Reuse the same idempotencyKey when retrying so the API does not charge twice.
 */
export type ProcessQuotationPaymentCommand = {
  quotation: Quotation
  card: SimulatedCardProps
  idempotencyKey?: string
}
