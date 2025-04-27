<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import Dialog from './components/dialog/index.vue';
import Header from './components/header/index.vue';
import List from './components/list/index.vue';
import Search from './components/search/index.vue';
import type { Project } from './utils/git-finder';

type DialogType = InstanceType<typeof Dialog>;
const dialogRef = useTemplateRef<DialogType>('dialogRef');

type ListType = InstanceType<typeof List>;
const listRef = useTemplateRef<ListType>('listRef');

type SearchType = InstanceType<typeof Search>;
const searchRef = useTemplateRef<SearchType>('searchRef');

const searchLoading = ref(false);
function foundProjects(value: Project[]) {
  listRef.value?.setData(value);
}

const selectItem = ref<Project[]>([]);

function handleUpdate(value: Project[]) {
  selectItem.value = value;
  dialogRef.value?.open();
}
function handleSuccess() {
  searchRef.value?.handleSelectFolder();
}
</script>

<template>
  <div w-100vw h-100vh flex="~ col" of-hidden>
    <Header />
    <Search
      ref="searchRef"
      v-model:loading="searchLoading"
      class="px-3 mt-4"
      @found-projects="foundProjects"
    />
    <List
      ref="listRef"
      :loading="searchLoading"
      class="px-3 mt-4 h-[calc(100%-91px)]"
      @update="handleUpdate"
    />
    <Dialog ref="dialogRef" :data="selectItem" @success="handleSuccess" />
  </div>
</template>
