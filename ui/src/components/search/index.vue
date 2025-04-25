<script setup lang="ts">
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';

const emits = defineEmits<{
  (e: 'search', value: string): void;
}>();

defineProps<{
  loading: boolean;
}>();

const search = ref('');
function clearSearch() {
  search.value = '';
}

function handleSearch() {
  emits('search', search.value);
}
</script>

<template>
  <div flex gap-2 w-full>
    <IconField class="flex-1">
      <InputText
        v-model="search"
        type="text"
        class="w-full"
        placeholder="请输入路径"
        @keydown.enter="handleSearch"
      />
      <InputIcon
        v-show="search"
        class="i-carbon-close-large cursor-pointer hover:text-red-500"
        @click="clearSearch"
      />
    </IconField>
    <Button
      label="搜索"
      :loading="loading"
      icon="i-carbon:search text-5"
      :disabled="!search"
      min-w-20
      @click="handleSearch"
    />
  </div>
</template>
