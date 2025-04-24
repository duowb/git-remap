<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable, { type DataTableRowSelectAllEvent } from 'primevue/datatable';
import { ref, shallowRef, watch } from 'vue';
import type { Project } from '../../../../src/types';

const selectItem = ref<Project[]>([]);
const props = defineProps<{
  searchPath: string;
}>();
const loading = defineModel('loading', { required: true });

const emit = defineEmits<{
  (e: 'update', value: Project[]): void;
}>();

const listData = shallowRef<Project[]>([]);

function getData() {
  loading.value = true;
  useFetch<{
    data: Project[];
    code: number;
    message: string;
  }>(`/api/files?path=${props.searchPath}`)
    .json()
    .then(({ data }) => {
      loading.value = false;
      if (data.value.code !== 200) return;
      listData.value = data.value.data;
    });
}

watch(
  () => props.searchPath,
  (n) => {
    if (!n) return;
    getData();
  }
);

function handleRowSelectAll({ data }: DataTableRowSelectAllEvent) {
  selectItem.value = data;
}

function handleRowUnselectAll() {
  selectItem.value = [];
}
function handleUpdate(data: Project[]) {
  emit('update', data);
}
</script>

<template>
  <DataTable
    v-model:selection="selectItem"
    :value="listData"
    data-key="projectPath"
    size="small"
    scrollable
    scroll-height="flex"
    @row-select-all="handleRowSelectAll"
    @row-unselect-all="handleRowUnselectAll"
  >
    <template #empty>
      <div class="text-center w-full">暂无数据</div>
    </template>
    <Column selection-mode="multiple" />
    <Column field="projectName" header="项目" />
    <Column field="projectType" header="类型">
      <template #body="{ data }">
        <span
          text-xl
          block
          :class="`i-vscode-icons-file-type-${data.projectType}`"
          :title="data.projectType"
        />
      </template>
    </Column>
    <Column field="currentBranch" header="分支" />
    <Column field="remoteUrl" header="源地址" />
    <Column class="text-center" header-style="width: 10rem;height: 3rem">
      <template #header>
        <Button
          v-if="selectItem.length > 0"
          label="批量修改"
          severity="help"
          variant="text"
          size="small"
          :badge="selectItem.length.toString()"
          @click="handleUpdate(selectItem)"
        />
      </template>
      <template #body="{ data }">
        <Button severity="help" variant="text" size="small" @click="handleUpdate([data])">
          修改
        </Button>
      </template>
    </Column>
  </DataTable>
</template>
