<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import type { Project } from '../../src/types';
import Dialog from './components/dialog/index.vue';
import Header from './components/header/index.vue';
import List from './components/list/index.vue';
import Search from './components/search/index.vue';

type DialogType = InstanceType<typeof Dialog>;
const dialogRef = useTemplateRef<DialogType>('dialogRef');

type ListType = InstanceType<typeof List>;
const listRef = useTemplateRef<ListType>('listRef');

const searchLoading = ref(false);
function handleSearch(value: string) {
  listRef.value?.getData(value);
}

const selectItem = ref<Project[]>([]);

function handleUpdate(value: Project[]) {
  selectItem.value = value;
  dialogRef.value?.open();
}
</script>

<template>
  <div w-100vw h-100vh flex="~ col" of-hidden>
    <Header />
    <Search class="px-3 mt-4" :loading="searchLoading" @search="handleSearch" />
    <List
      ref="listRef"
      v-model:loading="searchLoading"
      class="px-3 mt-4 h-[calc(100%-91px)]"
      @update="handleUpdate"
    />
    <Dialog ref="dialogRef" :data="selectItem" />
  </div>
</template>
