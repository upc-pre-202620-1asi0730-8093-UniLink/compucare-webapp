import { createRouter, createWebHistory } from 'vue-router'
import { quotationsRoutes } from '../quotations-payments/presentation/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/quotations',
    },
    ...quotationsRoutes,
  ],
})

export default router
