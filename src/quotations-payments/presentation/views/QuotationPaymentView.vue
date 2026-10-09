<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from '../../../shared/presentation/composables/useToast'
import type { ProcessedPayment } from '../../application/ports/PaymentRepository'
import type { Quotation } from '../../domain/entities/Quotation'
import { PaymentStatus } from '../../domain/enums/PaymentStatus'
import { QuotationStatus } from '../../domain/enums/QuotationStatus'
import {
  errorMessage,
  formatDateTime,
  formatMoney,
  itemKindLabels,
  quotationStatusLabels,
} from '../formatters'
import { quotationModule, usingDemoData } from '../quotationModule'

const props = defineProps<{ id: string }>()

const router = useRouter()
const toast = useToast()

const currentYear = new Date().getFullYear()
const months = Array.from({ length: 12 }, (_, index) => index + 1)
const years = Array.from({ length: 11 }, (_, index) => currentYear + index)

const quotation = shallowRef<Quotation | null>(null)
const loading = ref(true)
const loadError = ref('')

const card = reactive({
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
})

const submitting = ref(false)
const error = ref('')
const paid = shallowRef<ProcessedPayment | null>(null)

let idempotencyKey = crypto.randomUUID()

async function load() {
  loading.value = true
  loadError.value = ''

  try {
    const quotations = await quotationModule.listQuotations.execute()
    quotation.value = quotations.find((item) => item.id === props.id) ?? null

    if (!quotation.value) {
      loadError.value = 'No se encontró la cotización.'
    }
  } catch (e) {
    loadError.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function pay() {
  if (!quotation.value) {
    return
  }

  submitting.value = true
  error.value = ''

  try {
    const result = await quotationModule.processQuotationPayment.execute({
      quotation: quotation.value,
      card: {
        holderName: card.holderName,
        number: card.number,
        expiryMonth: Number(card.expiryMonth),
        expiryYear: Number(card.expiryYear),
        cvv: card.cvv,
      },
      idempotencyKey,
    })

    if (result.payment.status === PaymentStatus.PAID) {
      paid.value = result
      toast.success(
        result.receipt
          ? `Pago registrado con éxito. Comprobante ${result.receipt.number}.`
          : 'Pago registrado con éxito.',
      )
    } else {
      idempotencyKey = crypto.randomUUID()
      error.value = 'El pago fue rechazado. Intenta con otra tarjeta.'
    }
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}

function cancel() {
  router.push({ name: 'quotations' })
}

onMounted(load)
</script>

<template>
  <section>
    <div class="qp-page-header">
      <div>
        <h1>Registrar pago</h1>
        <p class="qp-subtitle">Pago simulado de los repuestos y servicios adicionales autorizados.</p>
      </div>
      <RouterLink :to="{ name: 'quotations' }" class="qp-btn qp-btn-secondary">Volver</RouterLink>
    </div>

    <div v-if="loading" class="qp-card qp-empty">Cargando cotización…</div>

    <p v-else-if="loadError" class="qp-alert qp-alert-error" role="alert">{{ loadError }}</p>

    <template v-else-if="quotation">
      <div class="payment-layout">
        <div class="qp-card">
          <h2>Ticket {{ quotation.requestId }}</h2>
          <table class="qp-table">
            <tbody>
              <tr v-for="item in quotation.items" :key="item.id">
                <td>
                  {{ item.description }}
                  <div class="qp-hint">{{ itemKindLabels[item.kind] }} · {{ item.quantity }} × {{ formatMoney(item.unitPrice) }}</div>
                </td>
                <td class="num">{{ formatMoney(item.subtotal()) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="qp-total total-line">Total a pagar: {{ formatMoney(quotation.total()) }}</p>
        </div>

        <div v-if="paid" class="qp-card receipt">
          <h2>Comprobante de pago</h2>
          <dl>
            <dt>N.° de comprobante</dt>
            <dd>{{ paid.receipt?.number ?? '—' }}</dd>
            <dt>Fecha</dt>
            <dd>{{ paid.receipt ? formatDateTime(paid.receipt.issuedAt) : '—' }}</dd>
            <dt>Monto</dt>
            <dd>{{ formatMoney(paid.payment.amount) }}</dd>
            <dt>Tarjeta</dt>
            <dd>•••• {{ card.number.replace(/\D/g, '').slice(-4) }}</dd>
            <dt>Estado</dt>
            <dd><span class="qp-badge qp-badge-approved">Pagado</span></dd>
          </dl>
          <RouterLink :to="{ name: 'quotations' }" class="qp-btn">Volver a cotizaciones</RouterLink>
        </div>

        <div v-else-if="quotation.status !== QuotationStatus.APPROVED" class="qp-card">
          <p class="qp-alert qp-alert-error" role="alert">
            Solo se pueden pagar cotizaciones aprobadas. Esta cotización está
            <strong>{{ quotationStatusLabels[quotation.status] }}</strong>.
          </p>
        </div>

        <form v-else class="qp-card" @submit.prevent="pay">
          <h2>Tarjeta de prueba</h2>
          <p v-if="error" class="qp-alert qp-alert-error" role="alert">{{ error }}</p>

          <div class="qp-grid">
            <div class="qp-field">
              <label for="holderName">Titular</label>
              <input id="holderName" v-model="card.holderName" type="text" autocomplete="cc-name" required />
            </div>
            <div class="qp-field">
              <label for="cardNumber">Número de tarjeta</label>
              <input
                id="cardNumber"
                v-model="card.number"
                type="text"
                inputmode="numeric"
                autocomplete="cc-number"
                placeholder="4111 1111 1111 1111"
                pattern="[\d\s\-]{13,23}"
                required
              />
            </div>
            <div class="expiry-grid">
              <div class="qp-field">
                <label for="expiryMonth">Mes</label>
                <select id="expiryMonth" v-model="card.expiryMonth" autocomplete="cc-exp-month" required>
                  <option value="" disabled>MM</option>
                  <option v-for="month in months" :key="month" :value="month">
                    {{ String(month).padStart(2, '0') }}
                  </option>
                </select>
              </div>
              <div class="qp-field">
                <label for="expiryYear">Año</label>
                <select id="expiryYear" v-model="card.expiryYear" autocomplete="cc-exp-year" required>
                  <option value="" disabled>AAAA</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
              <div class="qp-field">
                <label for="cvv">CVV</label>
                <input
                  id="cvv"
                  v-model="card.cvv"
                  type="password"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  pattern="\d{3,4}"
                  maxlength="4"
                  required
                />
              </div>
            </div>
          </div>

          <p v-if="usingDemoData" class="qp-hint test-cards">
            Tarjetas de prueba: <strong>4111 1111 1111 1111</strong> se aprueba ·
            <strong>4000 0000 0000 0002</strong> se rechaza.
          </p>

          <div class="qp-form-actions pay-actions">
            <button type="button" class="qp-btn qp-btn-secondary qp-btn-large" :disabled="submitting" @click="cancel">
              Cancelar
            </button>
            <button type="submit" class="qp-btn qp-btn-large" :disabled="submitting">
              {{ submitting ? 'Procesando pago…' : `Pagar ${formatMoney(quotation.total())}` }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </section>
</template>

<style scoped>
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.total-line {
  margin: 16px 0 0;
  text-align: right;
}

.expiry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.test-cards {
  margin: 16px 0 0;
  line-height: 1.5;
}

.pay-actions {
  margin-top: 20px;
}

.receipt dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px 20px;
  margin: 0 0 20px;
}

.receipt dt {
  color: var(--cc-muted);
}

.receipt dd {
  margin: 0;
  font-weight: 700;
}

@media (max-width: 1100px) {
  .payment-layout {
    grid-template-columns: 1fr;
  }
}
</style>
