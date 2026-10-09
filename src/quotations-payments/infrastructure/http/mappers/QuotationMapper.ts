import type { QuotationListFilters } from '../../../application/ports/QuotationRepository'
import { Quotation } from '../../../domain/entities/Quotation'
import { QuotationItem } from '../../../domain/entities/QuotationItem'
import { QuotationItemKind } from '../../../domain/enums/QuotationItemKind'
import { QuotationStatus } from '../../../domain/enums/QuotationStatus'
import { Money } from '../../../domain/value-objects/Money'
import type { CreateQuotationRequestDto } from '../dtos/CreateQuotationRequestDto'
import type { ListQuotationsQueryDto } from '../dtos/ListQuotationsQueryDto'
import type { QuotationResponseDto } from '../dtos/QuotationResponseDto'

const quotationStatuses = new Set<string>(Object.values(QuotationStatus))
const itemKinds = new Set<string>(Object.values(QuotationItemKind))

export const QuotationMapper = {
  toCreateRequest(quotation: Quotation): CreateQuotationRequestDto {
    return {
      requestId: quotation.requestId,
      companyId: quotation.companyId,
      currency: quotation.currency.code,
      validUntil: quotation.validUntil.toISOString(),
      status: quotation.status,
      items: quotation.items.map((item) => ({
        kind: item.kind,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
      })),
    }
  },

  toListQuery(filters: QuotationListFilters): ListQuotationsQueryDto {
    return {
      status: filters.status,
      requestId: filters.requestId,
      decidedFrom: filters.decidedFrom?.toISOString(),
      decidedTo: filters.decidedTo?.toISOString(),
    }
  },

  toDomain(dto: QuotationResponseDto): Quotation {
    const status = parseQuotationStatus(dto.status)
    const items = (dto.items ?? []).map((item) =>
      QuotationItem.create({
        id: item.id,
        quotationId: dto.id,
        kind: parseItemKind(item.kind),
        description: item.description,
        quantity: item.quantity,
        unitPrice: Money.create(item.unitPrice, dto.currency),
      }),
    )

    return Quotation.create({
      id: dto.id,
      requestId: dto.requestId,
      companyId: dto.companyId,
      version: dto.version,
      status,
      currency: dto.currency,
      validUntil: new Date(dto.validUntil),
      decidedBy: dto.decidedBy,
      decidedAt: dto.decidedAt ? new Date(dto.decidedAt) : null,
      items,
    })
  },
}

function parseQuotationStatus(value: string): QuotationStatus {
  if (!quotationStatuses.has(value)) {
    throw new Error(`Unknown quotation status from API: ${value}`)
  }

  return value as QuotationStatus
}

function parseItemKind(value: string): QuotationItemKind {
  if (!itemKinds.has(value)) {
    throw new Error(`Unknown quotation item kind from API: ${value}`)
  }

  return value as QuotationItemKind
}
