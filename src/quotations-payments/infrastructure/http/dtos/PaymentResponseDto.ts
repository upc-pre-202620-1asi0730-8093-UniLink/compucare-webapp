/**
 * Response from POST /api/v1/quotations/{id}/payments (201 Created).
 */
export type PaymentResponseDto = {
  id: string
  companyId: string
  periodId: string | null
  quotationId: string | null
  amount: number
  currency: string
  status: string
  isSimulated: boolean
  idempotencyKey: string
  receiptNumber: string | null
  paidAt: string | null
}
