import { Quotation } from '../../domain/entities/Quotation'
import { QuotationItem } from '../../domain/entities/QuotationItem'
import { QuotationItemKind } from '../../domain/enums/QuotationItemKind'
import { QuotationStatus } from '../../domain/enums/QuotationStatus'
import { Money } from '../../domain/value-objects/Money'
import { DEMO_ADMIN_ID, DEMO_COMPANY_ID } from './demoIdentity'

type SeedItem = {
  kind: QuotationItemKind
  description: string
  quantity: number
  unitPrice: number
}

type SeedQuotation = {
  requestId: string
  status: QuotationStatus
  validUntil: Date
  decidedAt?: Date
  items: SeedItem[]
}

function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function buildQuotation(seed: SeedQuotation): Quotation {
  const id = crypto.randomUUID()
  const decided = seed.status === QuotationStatus.APPROVED || seed.status === QuotationStatus.REJECTED

  return Quotation.create({
    id,
    requestId: seed.requestId,
    companyId: DEMO_COMPANY_ID,
    status: seed.status,
    currency: 'PEN',
    validUntil: seed.validUntil,
    decidedBy: decided ? DEMO_ADMIN_ID : null,
    decidedAt: decided ? (seed.decidedAt ?? new Date()) : null,
    items: seed.items.map((item) =>
      QuotationItem.create({
        id: crypto.randomUUID(),
        quotationId: id,
        kind: item.kind,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Money.create(item.unitPrice, 'PEN'),
      }),
    ),
  })
}

export function seedQuotations(): Quotation[] {
  const now = new Date()
  const earlierThisMonth = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 2), 10)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15, 16)

  const seeds: SeedQuotation[] = [
    {
      requestId: 'TCK-1042',
      status: QuotationStatus.PENDING_APPROVAL,
      validUntil: daysFromNow(10),
      items: [
        { kind: QuotationItemKind.SPARE_PART, description: 'SSD Kingston A400 480 GB', quantity: 1, unitPrice: 189.9 },
        { kind: QuotationItemKind.ADDITIONAL_SERVICE, description: 'Instalación y clonación de disco', quantity: 1, unitPrice: 60 },
      ],
    },
    {
      requestId: 'TCK-1047',
      status: QuotationStatus.PENDING_APPROVAL,
      validUntil: daysFromNow(6),
      items: [
        { kind: QuotationItemKind.SPARE_PART, description: 'Memoria RAM DDR4 8 GB 3200 MHz', quantity: 2, unitPrice: 115 },
      ],
    },
    {
      requestId: 'TCK-1031',
      status: QuotationStatus.APPROVED,
      validUntil: daysFromNow(4),
      decidedAt: earlierThisMonth,
      items: [
        { kind: QuotationItemKind.SPARE_PART, description: 'Fuente de poder 500 W 80 Plus', quantity: 1, unitPrice: 165 },
        { kind: QuotationItemKind.SPARE_PART, description: 'Pasta térmica Arctic MX-4', quantity: 1, unitPrice: 25 },
      ],
    },
    {
      requestId: 'TCK-1019',
      status: QuotationStatus.APPROVED,
      validUntil: daysFromNow(-10),
      decidedAt: lastMonth,
      items: [
        { kind: QuotationItemKind.SPARE_PART, description: 'Teclado USB Logitech K120', quantity: 3, unitPrice: 45 },
      ],
    },
    {
      requestId: 'TCK-1025',
      status: QuotationStatus.REJECTED,
      validUntil: daysFromNow(2),
      decidedAt: earlierThisMonth,
      items: [
        { kind: QuotationItemKind.SPARE_PART, description: 'Monitor LG 24" IPS Full HD', quantity: 1, unitPrice: 620 },
      ],
    },
  ]

  return seeds.map(buildQuotation)
}
