/**
 * Body for POST /api/v1/quotations/{id}/payments
 */
export type ProcessQuotationPaymentRequestDto = {
  amount: number
  currency: string
  idempotencyKey: string
  isSimulated: boolean
  card: {
    holderName: string
    last4: string
    expiryMonth: number
    expiryYear: number
  }
}
