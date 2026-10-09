import { ApiError } from '../../shared/infrastructure/http/ApiError'
import { QuotationItemKind } from '../domain/enums/QuotationItemKind'
import { QuotationStatus } from '../domain/enums/QuotationStatus'
import type { Money } from '../domain/value-objects/Money'

export const quotationStatusLabels: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'Borrador',
  [QuotationStatus.PENDING_APPROVAL]: 'Pendiente de aprobación',
  [QuotationStatus.APPROVED]: 'Aprobada',
  [QuotationStatus.REJECTED]: 'Rechazada',
}

export const quotationStatusBadges: Record<QuotationStatus, string> = {
  [QuotationStatus.DRAFT]: 'qp-badge qp-badge-draft',
  [QuotationStatus.PENDING_APPROVAL]: 'qp-badge qp-badge-pending',
  [QuotationStatus.APPROVED]: 'qp-badge qp-badge-approved',
  [QuotationStatus.REJECTED]: 'qp-badge qp-badge-rejected',
}

export const itemKindLabels: Record<QuotationItemKind, string> = {
  [QuotationItemKind.SPARE_PART]: 'Repuesto',
  [QuotationItemKind.ADDITIONAL_SERVICE]: 'Servicio adicional',
}

export function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: currencyCode }).format(amount)
}

export function formatMoney(money: Money): string {
  return formatAmount(money.amount, money.currency.code)
}

export function formatDate(date: Date | null): string {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

/** 'YYYY-MM-DD' in local time, as used by <input type="date">. */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const GENERIC_ERROR = 'No pudimos completar la operación. Inténtalo nuevamente.'

/** Domain and adapter errors are in English; users must only see plain Spanish (heuristic #4). */
const domainErrorMessages: { pattern: RegExp; message: string }[] = [
  { pattern: /requestId is required/i, message: 'Ingresa el ticket de soporte.' },
  { pattern: /at least one item|without items/i, message: 'Agrega al menos un repuesto o servicio.' },
  { pattern: /description is required/i, message: 'Completa la descripción de cada ítem.' },
  { pattern: /quantity must be greater than zero/i, message: 'La cantidad de cada ítem debe ser mayor a cero.' },
  { pattern: /amount cannot be negative|finite number/i, message: 'Revisa los precios ingresados.' },
  { pattern: /validUntil|expired quotation/i, message: 'La fecha de vigencia debe ser posterior a hoy.' },
  { pattern: /Cannot (approve|reject) quotation in status/i, message: 'Esta cotización ya fue procesada. Actualiza la lista.' },
  { pattern: /Only approved quotations can be paid/i, message: 'Solo se pueden pagar cotizaciones aprobadas.' },
  { pattern: /zero total/i, message: 'La cotización no tiene un monto a pagar.' },
  { pattern: /already been paid/i, message: 'Esta cotización ya fue pagada.' },
  { pattern: /holder name/i, message: 'Ingresa el nombre del titular de la tarjeta.' },
  { pattern: /Card number is invalid/i, message: 'El número de tarjeta no es válido.' },
  { pattern: /CVV/i, message: 'El CVV debe tener 3 o 4 dígitos.' },
  { pattern: /Card is expired/i, message: 'La tarjeta está vencida.' },
  { pattern: /expiry/i, message: 'Revisa la fecha de vencimiento de la tarjeta.' },
  { pattern: /not found/i, message: 'No encontramos la cotización.' },
]

function apiErrorMessage(status: number): string {
  if (status === 400 || status === 422) {
    return 'Revisa los datos ingresados e inténtalo nuevamente.'
  }

  if (status === 401 || status === 403) {
    return 'No tienes permisos para realizar esta acción.'
  }

  if (status === 404) {
    return 'No encontramos la cotización.'
  }

  if (status === 409) {
    return 'La cotización cambió de estado. Actualiza la lista e inténtalo nuevamente.'
  }

  if (status >= 500) {
    return 'El servicio no está disponible en este momento. Inténtalo más tarde.'
  }

  return GENERIC_ERROR
}

export function errorMessage(error: unknown): string {
  console.error(error)

  if (error instanceof ApiError) {
    return apiErrorMessage(error.status)
  }

  if (error instanceof TypeError) {
    return 'No pudimos conectarnos con el servidor. Revisa tu conexión.'
  }

  if (error instanceof Error) {
    const match = domainErrorMessages.find(({ pattern }) => pattern.test(error.message))
    return match?.message ?? GENERIC_ERROR
  }

  return GENERIC_ERROR
}
