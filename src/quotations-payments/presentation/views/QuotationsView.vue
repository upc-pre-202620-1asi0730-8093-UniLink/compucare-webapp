<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from '../../../shared/presentation/composables/useToast'
import type { Quotation } from '../../domain/entities/Quotation'
import { QuotationDecision } from '../../domain/enums/QuotationDecision'
import { QuotationStatus } from '../../domain/enums/QuotationStatus'
import {
  errorMessage,
  formatDate,
  formatMoney,
  itemKindLabels,
  quotationStatusBadges,
  quotationStatusLabels,
} from '../formatters'
import { quotationModule } from '../quotationModule'

type StatusFilter = QuotationStatus | 'ALL'

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: QuotationStatus.PENDING_APPROVAL, label: 'Pendientes' },
  { value: QuotationStatus.APPROVED, label: 'Aprobadas' },
  { value: QuotationStatus.REJECTED, label: 'Rechazadas' },
  { value: 'ALL', label: 'Todas' },
]

const toast = useToast()

const activeFilter = ref<StatusFilter>(QuotationStatus.PENDING_APPROVAL)
const quotations = shallowRef<Quotation[]>([])
const loading = ref(false)
const error = ref('')
const processingId = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = ''

  try {
    quotations.value = await quotationModule.listQuotations.execute(
      activeFilter.value === 'ALL' ? {} : { status: activeFilter.value },
    )
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

function selectFilter(filter: StatusFilter) {
  activeFilter.value = filter
  load()
}

async function decide(quotation: Quotation, status: QuotationDecision) {
  const approving = status === QuotationDecision.APPROVED
  const verb = approving ? 'aprobar' : 'rechazar'

  if (!window.confirm(`¿Deseas ${verb} la cotización del ticket ${quotation.requestId} por ${formatMoney(quotation.total())}?`)) {
    return
  }

  processingId.value = quotation.id
  error.value = ''

  try {
    await quotationModule.changeQuotationStatus.execute({ quotationId: quotation.id, status })
    toast.success(
      approving
        ? `Cotización del ticket ${quotation.requestId} aprobada. Se notificará al técnico para proceder con la compra.`
        : `Cotización del ticket ${quotation.requestId} rechazada. La orden de servicio queda en pausa.`,
    )
    await load()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    processingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <section>
    <div class="qp-page-header">
      <div>
        <h1>Cotizaciones</h1>
        <p class="qp-subtitle">
          Revisa los repuestos y servicios adicionales que propone el técnico y autoriza o rechaza el gasto.
        </p>
      </div>
      <RouterLink :to="{ name: 'quotation-create' }" class="qp-btn">Nueva cotización</RouterLink>
    </div>

    <div class="qp-tabs" role="tablist" aria-label="Filtrar por estado">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        type="button"
        role="tab"
        class="qp-tab"
        :class="{ active: activeFilter === filter.value }"
        :aria-selected="activeFilter === filter.value"
        @click="selectFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <p v-if="error" class="qp-alert qp-alert-error" role="alert">{{ error }}</p>

    <div v-if="loading && quotations.length === 0" class="qp-card qp-empty">Cargando cotizaciones…</div>

    <div v-else-if="quotations.length === 0" class="qp-card qp-empty">
      No hay cotizaciones en este estado.
    </div>

    <article v-for="quotation in quotations" :key="quotation.id" class="qp-card">
      <header class="quotation-header">
        <div>
          <h2 class="quotation-title">Ticket {{ quotation.requestId }}</h2>
          <p class="qp-hint quotation-dates">
            Válida hasta {{ formatDate(quotation.validUntil) }}
            <template v-if="quotation.decidedAt"> · Decidida el {{ formatDate(quotation.decidedAt) }}</template>
          </p>
        </div>
        <span :class="quotationStatusBadges[quotation.status]">
          {{ quotationStatusLabels[quotation.status] }}
        </span>
      </header>

      <table class="qp-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th class="num">Cant.</th>
            <th class="num">Precio unitario</th>
            <th class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in quotation.items" :key="item.id">
            <td>{{ itemKindLabels[item.kind] }}</td>
            <td>{{ item.description }}</td>
            <td class="num">{{ item.quantity }}</td>
            <td class="num">{{ formatMoney(item.unitPrice) }}</td>
            <td class="num">{{ formatMoney(item.subtotal()) }}</td>
          </tr>
        </tbody>
      </table>

      <footer class="quotation-footer">
        <p class="qp-total">Total: {{ formatMoney(quotation.total()) }}</p>

        <div class="quotation-actions">
          <template v-if="quotation.status === QuotationStatus.PENDING_APPROVAL">
            <button
              type="button"
              class="qp-btn qp-btn-danger"
              :disabled="processingId !== null"
              @click="decide(quotation, QuotationDecision.REJECTED)"
            >
              Rechazar
            </button>
            <button
              type="button"
              class="qp-btn"
              :disabled="processingId !== null"
              @click="decide(quotation, QuotationDecision.APPROVED)"
            >
              {{ processingId === quotation.id ? 'Procesando…' : 'Aprobar' }}
            </button>
          </template>

          <RouterLink
            v-else-if="quotation.status === QuotationStatus.APPROVED"
            :to="{ name: 'quotation-payment', params: { id: quotation.id } }"
            class="qp-btn"
          >
            Registrar pago
          </RouterLink>
        </div>
      </footer>
    </article>
  </section>
</template>

<style scoped>
.quotation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.quotation-title {
  margin-bottom: 4px;
}

.quotation-dates {
  margin-bottom: 0;
}

.quotation-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.quotation-footer .qp-total {
  margin-bottom: 0;
}

.quotation-actions {
  display: flex;
  gap: 12px;
}
</style>
