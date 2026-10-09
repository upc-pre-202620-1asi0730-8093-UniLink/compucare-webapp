import { readonly, ref } from 'vue'

export type Toast = {
  id: number
  message: string
}

const DISMISS_AFTER_MS = 4500

const toasts = ref<Toast[]>([])
let nextId = 1

function dismiss(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function success(message: string) {
  const id = nextId++
  toasts.value = [...toasts.value, { id, message }]
  setTimeout(() => dismiss(id), DISMISS_AFTER_MS)
}

/** Green floating confirmation shown after an action completes (heuristic #1). */
export function useToast() {
  return {
    toasts: readonly(toasts),
    success,
    dismiss,
  }
}
