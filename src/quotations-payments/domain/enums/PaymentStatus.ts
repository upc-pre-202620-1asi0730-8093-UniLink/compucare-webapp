/**
 * Lifecycle of a payment (BC05).
 * Simulated payments confirm to PAID (US-28).
 */
export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]
