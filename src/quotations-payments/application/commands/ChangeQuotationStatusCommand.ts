import type { QuotationDecision } from '../../domain/enums/QuotationDecision'

/**
 * Input for a company admin approving or rejecting a quotation (US-26 / US-30).
 * The deciding user is resolved by the API from the JWT.
 */
export type ChangeQuotationStatusCommand = {
  quotationId: string
  status: QuotationDecision
}
