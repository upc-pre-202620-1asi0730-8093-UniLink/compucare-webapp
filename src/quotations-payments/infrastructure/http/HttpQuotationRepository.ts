import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import type {
  QuotationListFilters,
  QuotationRepository,
} from '../../application/ports/QuotationRepository'
import type { Quotation } from '../../domain/entities/Quotation'
import type { QuotationDecision } from '../../domain/enums/QuotationDecision'
import type { ChangeQuotationStatusRequestDto } from './dtos/ChangeQuotationStatusRequestDto'
import type { ListQuotationsQueryDto } from './dtos/ListQuotationsQueryDto'
import type { QuotationResponseDto } from './dtos/QuotationResponseDto'
import { QuotationMapper } from './mappers/QuotationMapper'

const QUOTATIONS_PATH = '/api/v1/quotations'
const QUOTES_PATH = '/api/v1/quotes'

/**
 * Infrastructure adapter for the quotations API.
 */
export class HttpQuotationRepository implements QuotationRepository {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async create(quotation: Quotation): Promise<Quotation> {
    const request = QuotationMapper.toCreateRequest(quotation)
    const response = await this.http.post<QuotationResponseDto>(QUOTATIONS_PATH, request)

    if (!response || !response.id) {
      throw new Error('POST /api/v1/quotations did not return a quotation body')
    }

    return QuotationMapper.toDomain(response)
  }

  async changeStatus(quotationId: string, status: QuotationDecision): Promise<Quotation> {
    const path = `${QUOTES_PATH}/${encodeURIComponent(quotationId)}/status`
    const request: ChangeQuotationStatusRequestDto = { status }
    const response = await this.http.put<QuotationResponseDto>(path, request)

    if (!response || !response.id) {
      throw new Error('PUT /api/v1/quotes/{id}/status did not return a quotation body')
    }

    return QuotationMapper.toDomain(response)
  }

  async list(filters: QuotationListFilters): Promise<Quotation[]> {
    const query = toQueryString(QuotationMapper.toListQuery(filters))
    const response = await this.http.get<QuotationResponseDto[]>(`${QUOTATIONS_PATH}${query}`)

    if (!Array.isArray(response)) {
      throw new Error('GET /api/v1/quotations did not return an array')
    }

    return response.map((dto) => QuotationMapper.toDomain(dto))
  }
}

function toQueryString(query: ListQuotationsQueryDto): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, value)
    }
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}
