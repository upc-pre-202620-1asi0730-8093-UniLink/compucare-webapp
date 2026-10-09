<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" role="status">
        <span class="toast-icon" aria-hidden="true">✓</span>
        <p class="toast-message">{{ toast.message }}</p>
        <button type="button" class="toast-close" aria-label="Cerrar notificación" @click="dismiss(toast.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(400px, calc(100vw - 48px));
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #c7f1c8;
  color: #112d35;
  border-left: 4px solid #087f75;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(17, 45, 53, 0.16);
}

.toast-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #087f75;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.toast-message {
  flex: 1;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

.toast-close {
  flex-shrink: 0;
  padding: 0 4px;
  border: none;
  background: transparent;
  color: #112d35;
  font-size: 20px;
  line-height: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
