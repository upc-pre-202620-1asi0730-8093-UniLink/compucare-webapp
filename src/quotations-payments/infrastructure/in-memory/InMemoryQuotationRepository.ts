import type {
  QuotationListFilters,
  QuotationRepository,
} from '../../application/ports/QuotationRepository'
import type { Quotation } from '../../domain/entities/Quotation'
import { QuotationDecision } from '../../domain/enums/QuotationDecision'
import { simulateLatency } from './simulateLatency'

/**
 * In-memory adapter used while the quotations API is not available.
 * State lives only for the browser session.
 */
export class InMemoryQuotationRepository implements QuotationRepository {
  private readonly store = new Map<string, Quotation>()
  private readonly deciderId: string

  constructor(seed: Quotation[], deciderId: string) {
    this.deciderId = deciderId
    for (const quotation of seed) {
      this.store.set(quotation.id, quotation)
    }
  }

  async create(quotation: Quotation): Promise<Quotation> {
    await simulateLatency()

    if (this.store.has(quotation.id)) {
      throw new Error(`Quotation ${quotation.id} already exists`)
    }

    this.store.set(quotation.id, quotation)
    return quotation
  }

  async changeStatus(quotationId: string, status: QuotationDecision): Promise<Quotation> {
    await simulateLatency()

    const quotation = this.store.get(quotationId)
    if (!quotation) {
      throw new Error(`Quotation ${quotationId} not found`)
    }

    if (status === QuotationDecision.APPROVED) {
      quotation.approve(this.deciderId)
    } else {
      quotation.reject(this.deciderId)
    }

    return quotation
  }

  async list(filters: QuotationListFilters): Promise<Quotation[]> {
    await simulateLatency()

    const { status, requestId, decidedFrom, decidedTo } = filters

    return [...this.store.values()]
      .filter((quotation) => !status || quotation.status === status)
      .filter((quotation) => !requestId || quotation.requestId === requestId)
      .filter((quotation) => {
        if (!decidedFrom && !decidedTo) {
          return true
        }

        const decidedAt = quotation.decidedAt?.getTime()
        if (decidedAt === undefined) {
          return false
        }

        return (
          (!decidedFrom || decidedAt >= decidedFrom.getTime()) &&
          (!decidedTo || decidedAt < decidedTo.getTime())
        )
      })
      .reverse()
  }
}
