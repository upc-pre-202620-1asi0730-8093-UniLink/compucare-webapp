<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../../shared/presentation/composables/useToast'
import { QuotationItemKind } from '../../domain/enums/QuotationItemKind'
import { errorMessage, formatAmount, itemKindLabels, toDateInputValue } from '../formatters'
import { currentCompanyId, quotationModule } from '../quotationModule'

type ItemRow = {
  key: number
  kind: QuotationItemKind
  description: string
  quantity: number
  unitPrice: number
}

const currencies = ['PEN', 'USD']
const itemKinds = Object.values(QuotationItemKind)

const router = useRouter()
const toast = useToast()

let nextRowKey = 1

function newRow(): ItemRow {
  return {
    key: nextRowKey++,
    kind: QuotationItemKind.SPARE_PART,
    description: '',
    quantity: 1,
    unitPrice: 0,
  }
}

function defaultValidUntil(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return toDateInputValue(date)
}

const requestId = ref('')
const currency = ref('PEN')
const validUntil = ref(defaultValidUntil())
const items = ref<ItemRow[]>([newRow()])
const submitting = ref(false)
const error = ref('')

const minValidUntil = toDateInputValue(new Date())

const total = computed(() =>
  items.value.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
)

const hasChanges = computed(
  () =>
    requestId.value.trim() !== '' ||
    items.value.length > 1 ||
    items.value.some((item) => item.description.trim() !== '' || item.unitPrice > 0),
)

function addItem() {
  items.value.push(newRow())
}

function removeItem(key: number) {
  items.value = items.value.filter((item) => item.key !== key)
}

function cancel() {
  if (hasChanges.value && !window.confirm('¿Deseas descartar la cotización? Se perderán los datos ingresados.')) {
    return
  }

  router.push({ name: 'quotations' })
}

async function submit() {
  submitting.value = true
  error.value = ''

  try {
    const quotation = await quotationModule.createQuotation.execute({
      requestId: requestId.value.trim(),
      companyId: currentCompanyId,
      currency: currency.value,
      validUntil: new Date(`${validUntil.value}T23:59:59`),
      items: items.value.map(({ kind, description, quantity, unitPrice }) => ({
        kind,
        description,
        quantity,
        unitPrice,
      })),
    })

    toast.success(`Cotización del ticket ${quotation.requestId} emitida con éxito. Quedó pendiente de aprobación.`)
    router.push({ name: 'quotations' })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <div class="qp-page-header">
      <div>
        <h1>Nueva cotización</h1>
        <p class="qp-subtitle">
          Detalla los repuestos o servicios que no cubre el plan para pedir la autorización de la empresa antes de reparar.
        </p>
      </div>
    </div>

    <form @submit.prevent="submit">
      <p v-if="error" class="qp-alert qp-alert-error" role="alert">{{ error }}</p>

      <div class="qp-card">
        <h2>Solicitud</h2>
        <div class="qp-grid header-grid">
          <div class="qp-field">
            <label for="requestId">Ticket de soporte</label>
            <input id="requestId" v-model="requestId" type="text" placeholder="Ej. TCK-1050" required />
          </div>
          <div class="qp-field">
            <label for="currency">Moneda</label>
            <select id="currency" v-model="currency">
              <option v-for="code in currencies" :key="code" :value="code">{{ code }}</option>
            </select>
          </div>
          <div class="qp-field">
            <label for="validUntil">Válida hasta</label>
            <input id="validUntil" v-model="validUntil" type="date" :min="minValidUntil" required />
          </div>
        </div>
      </div>

      <div class="qp-card">
        <h2>Repuestos y servicios</h2>

        <div v-for="(item, index) in items" :key="item.key" class="item-row">
          <div class="qp-field">
            <label :for="`kind-${item.key}`">Tipo</label>
            <select :id="`kind-${item.key}`" v-model="item.kind">
              <option v-for="kind in itemKinds" :key="kind" :value="kind">{{ itemKindLabels[kind] }}</option>
            </select>
          </div>
          <div class="qp-field">
            <label :for="`description-${item.key}`">Descripción</label>
            <input
              :id="`description-${item.key}`"
              v-model="item.description"
              type="text"
              placeholder="Ej. SSD 480 GB"
              required
            />
          </div>
          <div class="qp-field">
            <label :for="`quantity-${item.key}`">Cantidad</label>
            <input :id="`quantity-${item.key}`" v-model.number="item.quantity" type="number" min="1" step="1" required />
          </div>
          <div class="qp-field">
            <label :for="`unitPrice-${item.key}`">Precio unitario</label>
            <input
              :id="`unitPrice-${item.key}`"
              v-model.number="item.unitPrice"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="item-subtotal">
            <span class="qp-hint">Subtotal</span>
            <strong>{{ formatAmount((item.quantity || 0) * (item.unitPrice || 0), currency) }}</strong>
          </div>
          <button
            type="button"
            class="qp-btn qp-btn-link"
            :disabled="items.length === 1"
            :aria-label="`Quitar ítem ${index + 1}`"
            @click="removeItem(item.key)"
          >
            Quitar
          </button>
        </div>

        <button type="button" class="qp-btn qp-btn-secondary" @click="addItem">Agregar ítem</button>
      </div>

      <div class="qp-card">
        <h2>Confirmar</h2>
        <div class="confirm-row">
          <p class="qp-total">Total: {{ formatAmount(total, currency) }}</p>
          <div class="qp-form-actions">
            <button type="button" class="qp-btn qp-btn-secondary qp-btn-large" :disabled="submitting" @click="cancel">
              Cancelar
            </button>
            <button type="submit" class="qp-btn qp-btn-large" :disabled="submitting">
              {{ submitting ? 'Emitiendo…' : 'Emitir cotización' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.header-grid {
  grid-template-columns: 2fr 1fr 1fr;
}

.item-row {
  display: grid;
  grid-template-columns: 1.2fr 2.4fr 0.8fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--cc-gray);
}

.item-subtotal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
}

.confirm-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.confirm-row .qp-total {
  margin-bottom: 0;
}

@media (max-width: 1100px) {
  .header-grid,
  .item-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
