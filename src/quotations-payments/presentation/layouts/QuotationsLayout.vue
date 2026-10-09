<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppToast from '../../../shared/presentation/components/AppToast.vue'
import { usingDemoData } from '../quotationModule'
import '../styles/quotations.css'

const route = useRoute()

const roleLabel = computed(() => {
  const role = route.meta.role ?? ''
  return usingDemoData ? [role, 'Datos de demostración'].filter(Boolean).join(' · ') : role
})
</script>

<template>
  <div class="qp">
    <header class="qp-topbar">
      <RouterLink :to="{ name: 'quotations' }" class="qp-brand">CompuCare</RouterLink>
      <span class="qp-role">{{ roleLabel }}</span>
    </header>

    <div class="qp-body">
      <nav class="qp-sidebar" aria-label="Cotizaciones y pagos">
        <RouterLink :to="{ name: 'quotations' }">Cotizaciones</RouterLink>
        <RouterLink :to="{ name: 'quotation-create' }">Nueva cotización</RouterLink>
        <RouterLink :to="{ name: 'quotation-report' }">Reporte de gastos</RouterLink>
      </nav>

      <main class="qp-content">
        <RouterView />
        <footer class="qp-footer">UniLink · Propuesta de diseño académico</footer>
      </main>
    </div>

    <AppToast />
  </div>
</template>
