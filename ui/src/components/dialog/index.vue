<script setup lang="ts">
import { useFetch } from '@vueuse/core';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import type { Project } from '../../../../src/types';

const toast = useToast();

const props = defineProps<{
  data: Project[];
}>();

const visible = ref(false);
function close() {
  visible.value = false;
}

function open() {
  visible.value = true;
}

const oldUrl = computed(() => {
  if (props.data.length === 0) {
    return '';
  }
  const remoteUrl = props.data[0].remoteUrl;
  if (!remoteUrl) return '暂无git源地址';
  return new URL(remoteUrl).origin;
});

const newUrl = ref('');
const replaceLoading = ref(false);

async function replace() {
  replaceLoading.value = true;
  const newData = props.data.map((item) => {
    return {
      path: item.projectPath,
      newRemote: item.remoteUrl.replace(oldUrl.value, newUrl.value)
    };
  });
  const { data } = await useFetch<
    {
      path: string;
      newRemote: string;
      isReplaceSuccess: boolean;
    }[]
  >('/api/replace')
    .post({
      paths: newData
    })
    .json();
  replaceLoading.value = false;
  if (data.value.code !== 200) {
    toast.add({
      severity: 'error',
      detail: data.value.message
    });

    return;
  }
  close();
  const successCount = data.value.data.filter((item: any) => item.isReplaceSuccess).length;

  toast.add({
    severity: 'success',
    summary: '替换成功',
    detail: `共 ${successCount} 个地址替换成功`,
    life: 3000
  });
}

defineExpose({
  open,
  close
});
</script>

<template>
  <Toast />
  <Dialog v-model:visible="visible" modal header="修改地址" :style="{ width: '40rem' }">
    <div class="flex items-center gap-4 mb-4">
      <label for="oldUrl" class="font-semibold w-24">旧地址</label>
      <span id="oldUrl" class="flex-auto" autocomplete="off">{{ oldUrl }}</span>
    </div>
    <div class="flex items-center gap-4 mb-2">
      <label for="newUrl" class="font-semibold w-24">新地址</label>
      <InputText id="newUrl" v-model="newUrl" class="flex-auto" autocomplete="off" />
    </div>
    <template #footer>
      <Button label="取消" text severity="secondary" autofocus @click="close" />
      <Button
        label="替换"
        outlined
        severity="info"
        autofocus
        :disabled="newUrl.length === 0"
        @click="replace"
      />
    </template>
  </Dialog>
</template>
