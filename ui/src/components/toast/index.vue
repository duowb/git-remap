<script setup lang="ts">
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

function showSuccessToast(summary: string, message: string) {
  toast.add({ severity: 'success', summary, detail: message, life: 3000 });
}

function showErrorToast(summary: string, message: string) {
  toast.add({ severity: 'error', summary, detail: message, life: 3000 });
}

defineExpose({
  showSuccessToast,
  showErrorToast
});
</script>

<template>
  <Toast />
</template>
