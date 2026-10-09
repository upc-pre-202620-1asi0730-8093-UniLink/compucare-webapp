import type { HttpClient } from '../../../shared/infrastructure/http/HttpClient'
import type { QuotationRepository } from '../../application/ports/QuotationRepository'
import type { Quotation } from '../../domain/entities/Quotation'
import type { QuotationResponseDto } from './dtos/QuotationResponseDto'
import { QuotationMapper } from './mappers/QuotationMapper'

const QUOTATIONS_PATH = '/api/v1/quotations'

/**
 * Infrastructure adapter: emits quotations via POST /api/v1/quotations.
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
}
