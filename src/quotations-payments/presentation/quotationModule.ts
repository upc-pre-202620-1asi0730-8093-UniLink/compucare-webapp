import {
  createInMemoryQuotationModule,
  createQuotationModule,
} from '../infrastructure/composition/createQuotationModule'
import { DEMO_COMPANY_ID } from '../infrastructure/in-memory/demoIdentity'

export const usingDemoData = !import.meta.env.VITE_API_BASE_URL

/** Single instance so in-memory demo state survives navigation between views. */
export const quotationModule = usingDemoData
  ? createInMemoryQuotationModule()
  : createQuotationModule()

/** Until BC01 exposes the signed-in session, quotations are issued for the demo company. */
export const currentCompanyId = DEMO_COMPANY_ID
