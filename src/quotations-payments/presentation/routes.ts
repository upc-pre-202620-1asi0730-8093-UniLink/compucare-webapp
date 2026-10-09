import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    role?: string
  }
}

export const quotationsRoutes: RouteRecordRaw[] = [
  {
    path: '/quotations',
    component: () => import('./layouts/QuotationsLayout.vue'),
    children: [
      {
        path: '',
        name: 'quotations',
        component: () => import('./views/QuotationsView.vue'),
        meta: { role: 'Responsable' },
      },
      {
        path: 'new',
        name: 'quotation-create',
        component: () => import('./views/CreateQuotationView.vue'),
        meta: { role: 'Técnico' },
      },
      {
        path: 'report',
        name: 'quotation-report',
        component: () => import('./views/ExpenseReportView.vue'),
        meta: { role: 'Responsable' },
      },
      {
        path: ':id/payment',
        name: 'quotation-payment',
        component: () => import('./views/QuotationPaymentView.vue'),
        props: true,
        meta: { role: 'Responsable' },
      },
    ],
  },
]
