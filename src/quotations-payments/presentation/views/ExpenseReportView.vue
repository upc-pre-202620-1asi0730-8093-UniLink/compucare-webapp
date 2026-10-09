<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import type { MonthlyExpenseReport } from '../../application/queries/MonthlyExpenseReport'
import { errorMessage, formatAmount, formatDate, formatMoney, itemKindLabels } from '../formatters'
import { quotationModule } from '../quotationModule'

function currentMonthValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const month = ref(currentMonthValue())
const report = shallowRef<MonthlyExpenseReport | null>(null)
const loading = ref(false)
const error = ref('')

const monthLabel = computed(() => {
  const [year, monthNumber] = month.value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthNumber - 1, 1),
  )
})

async function load() {
  if (!month.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [year, monthNumber] = month.value.split('-').map(Number)
    report.value = await quotationModule.getMonthlyExpenseReport.execute({ year, month: monthNumber })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

watch(month, load)
onMounted(load)
</script>

<template>
  <section>
    <div class="qp-page-header">
      <div>
        <h1>Reporte de gastos adicionales</h1>
        <p class="qp-subtitle">Repuestos y servicios aprobados en el mes, para revisar lo facturado fuera del plan.</p>
      </div>
      <div class="qp-field month-field">
        <label for="month">Mes</label>
        <input id="month" v-model="month" type="month" />
      </div>
    </div>

    <p v-if="error" class="qp-alert qp-alert-error" role="alert">{{ error }}</p>

    <div v-if="loading && !report" class="qp-card qp-empty">Generando reporte…</div>

    <template v-else-if="report">
      <div class="summary-grid">
        <div class="qp-card summary-card">
          <span class="qp-hint">Cotizaciones aprobadas</span>
          <strong>{{ report.quotationCount }}</strong>
        </div>
        <div class="qp-card summary-card">
          <span class="qp-hint">Ítems facturados</span>
          <strong>{{ report.lines.length }}</strong>
        </div>
        <div class="qp-card summary-card">
          <span class="qp-hint">Total del mes</span>
          <strong v-if="report.totals.length === 0">{{ formatAmount(0, 'PEN') }}</strong>
          <strong v-for="total in report.totals" :key="total.currency.code">{{ formatMoney(total) }}</strong>
        </div>
      </div>

      <div class="qp-card">
        <h2 class="capitalize">Detalle de {{ monthLabel }}</h2>

        <p v-if="report.lines.length === 0" class="qp-empty">No hay cotizaciones aprobadas en este mes.</p>

        <table v-else class="qp-table">
          <thead>
            <tr>
              <th>Aprobada</th>
              <th>Ticket</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th class="num">Cant.</th>
              <th class="num">Precio unitario</th>
              <th class="num">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in report.lines" :key="`${line.quotationId}-${index}`">
              <td>{{ formatDate(line.decidedAt) }}</td>
              <td>{{ line.requestId }}</td>
              <td>{{ itemKindLabels[line.kind] }}</td>
              <td>{{ line.description }}</td>
              <td class="num">{{ line.quantity }}</td>
              <td class="num">{{ formatMoney(line.unitPrice) }}</td>
              <td class="num">{{ formatMoney(line.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<style scoped>
.month-field {
  min-width: 200px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card strong {
  font-size: 30px;
  font-weight: 700;
}

.capitalize::first-letter {
  text-transform: uppercase;
}

@media (max-width: 760px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
