<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import type { Project } from '../../src/types';
import Dialog from './components/dialog/index.vue';
import Header from './components/header/index.vue';
import List from './components/list/index.vue';
import Search from './components/search/index.vue';

const searchLoading = ref(false);
const searchPath = ref('');
function handleSearch(value: string) {
  searchPath.value = value;
}

type DialogType = InstanceType<typeof Dialog>;
const dialogRef = useTemplateRef<DialogType>('dialogRef');

const selectItem = ref<Project[]>([]);

function handleUpdate(value: Project[]) {
  selectItem.value = value;
  dialogRef.value?.open();
}
</script>

<template>
  <div w-100vw h-100vh>
    <Header />
    <div px-4>
      <Search class="mt-4" :loading="searchLoading" @search="handleSearch" />
      <List
        v-model:loading="searchLoading"
        class="mt-4"
        :search-path="searchPath"
        @update="handleUpdate"
      />
    </div>
    <Dialog ref="dialogRef" :data="selectItem" />
  </div>
</template>
