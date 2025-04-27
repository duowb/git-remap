<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable, { type DataTableRowSelectAllEvent } from 'primevue/datatable';
import Skeleton from 'primevue/skeleton';
import { useConfirm } from 'primevue/useconfirm';
import { ref, shallowRef, useTemplateRef } from 'vue';
import Toast from '../toast/index.vue';

import type { Project } from '../../../../src/types';

type ToastType = InstanceType<typeof Toast>;

const confirm = useConfirm();

const selectItem = ref<Project[]>([]);

const loading = defineModel('loading', { required: true });

const toastRef = useTemplateRef<ToastType>('toastRef');

const emit = defineEmits<{
  (e: 'update', value: Project[]): void;
}>();

const listData = shallowRef<Project[]>([]);

function getData(searchPath: string) {
  loading.value = true;
  listData.value = [
    {
      projectName: '_skeleton',
      projectType: '_skeleton',
      currentBranch: '_skeleton',
      remoteUrl: '_skeleton',
      projectPath: '_skeleton'
    }
  ];
  handleRowUnselectAll();
  useFetch<{
    data: Project[];
    code: number;
    message: string;
  }>(`/api/files?path=${searchPath}`)
    .json()
    .then(({ data }) => {
      loading.value = false;
      if (data.value.code !== 200) {
        listData.value = [];
        toastRef.value?.showErrorToast('获取失败', data.value.message);
        return;
      }
      listData.value = data.value.data;
    });
}

function handleRowSelectAll({ data }: DataTableRowSelectAllEvent) {
  selectItem.value = data;
}

function handleRowUnselectAll() {
  selectItem.value = [];
}
function handleUpdate(data: Project[]) {
  if (data.length === 1) {
    emit('update', data);
    return;
  }
  let remoteUrlHostname = '';
  for (const item of data) {
    if (!item.remoteUrl) {
      toastRef.value?.showErrorToast(`操作失败`, `请先单独修改${item.projectName}项目`);
      return;
    }
    const currentItemHostname = new URL(item.remoteUrl).hostname;
    if (remoteUrlHostname && currentItemHostname !== remoteUrlHostname) {
      confirm.require({
        message: '所选的项目源地址不一致，是否继续？',
        header: '提示',
        rejectProps: {
          label: '取消',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: '继续',
          severity: 'danger'
        },
        accept: () => {
          emit('update', data);
        }
      });
      return;
    }
    remoteUrlHostname = currentItemHostname;
  }
  emit('update', data);
}

defineExpose({
  getData
});
</script>

<template>
  <div>
    <Toast ref="toastRef" />
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
      <Column v-if="!loading" selection-mode="multiple" />
      <Column field="projectName" header="项目">
        <template #body="{ data }">
          <Skeleton v-if="data.projectName === '_skeleton'" />
          <span v-else>{{ data.projectName }}</span>
        </template>
      </Column>
      <Column field="projectType" header="类型">
        <template #body="{ data }">
          <Skeleton v-if="data.projectType === '_skeleton'" />
          <span
            v-else
            text-xl
            block
            :class="`i-vscode-icons-file-type-${data.projectType}`"
            :title="data.projectType"
          />
        </template>
      </Column>
      <Column field="currentBranch" header="分支">
        <template #body="{ data }">
          <Skeleton v-if="data.currentBranch === '_skeleton'" />
          <span v-else>{{ data.currentBranch }}</span>
        </template>
      </Column>
      <Column field="remoteUrl" header="源地址">
        <template #body="{ data }">
          <Skeleton v-if="data.remoteUrl === '_skeleton'" />
          <span v-else>{{ data.remoteUrl }}</span>
        </template>
      </Column>
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
          <Skeleton v-if="data.remoteUrl === '_skeleton'" />
          <Button v-else severity="help" variant="text" size="small" @click="handleUpdate([data])">
            修改
          </Button>
        </template>
      </Column>
    </DataTable>
    <ConfirmDialog />
  </div>
</template>

<style>
.p-datatable-scrollable-table > .p-datatable-thead {
  z-index: 3;
}
</style>
