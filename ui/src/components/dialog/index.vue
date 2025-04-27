<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { computed, ref, useTemplateRef } from 'vue';
import { updateGitRemoteUrl, type Project } from '../../utils/git-finder';
import Toast from '../toast/index.vue';

type ToastType = InstanceType<typeof Toast>;

const toastRef = useTemplateRef<ToastType>('toastRef');

const props = defineProps<{
  data: Project[];
}>();

const emits = defineEmits<{
  (e: 'success'): void;
}>();

const visible = ref(false);
function close() {
  newUrl.value = '';
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
  if (props.data.length === 1) {
    return remoteUrl;
  }
  return new URL(remoteUrl).origin;
});

const newUrl = ref('');
const replaceLoading = ref(false);

function checkNewUrl() {
  try {
    const url = new URL(newUrl.value);
    if (url) {
      return true;
    }
  } catch {
    toastRef.value?.showErrorToast('操作失败', '请输入正确的地址');
    return false;
  }
  return false;
}
async function replace() {
  if (!checkNewUrl()) {
    return;
  }
  replaceLoading.value = true;
  const newData = props.data.map(async ({ gitHandle, remoteUrl }) => {
    let newRemoteUrl = remoteUrl.replace(oldUrl.value, newUrl.value);
    if (!remoteUrl.includes(oldUrl.value)) {
      const { origin } = new URL(remoteUrl);
      newRemoteUrl = remoteUrl.replace(origin, newUrl.value);
    }
    return await updateGitRemoteUrl(gitHandle, newRemoteUrl);
  });
  const isReplaceSuccess = await Promise.all(newData);
  const successCount = isReplaceSuccess.filter((item) => item).length;
  replaceLoading.value = false;
  if (successCount !== props.data.length) {
    toastRef.value?.showErrorToast('替换失败', `共 ${successCount} 个地址替换成功`);
    return;
  }
  toastRef.value?.showSuccessToast('替换成功', `共 ${successCount} 个地址替换成功`);
  close();
  emits('success');
}

defineExpose({
  open,
  close
});
</script>

<template>
  <Toast ref="toastRef" />
  <Dialog v-model:visible="visible" modal header="修改地址" :style="{ width: '40rem' }">
    <div class="mb-4">
      <span v-if="data.length === 1" class="text-sm text-gray-500"
        >当前是单个项目,请替换完整地址</span
      >
      <span v-if="data.length > 1" class="text-sm text-gray-500"
        >当前是多个项目,请替换部分地址</span
      >
    </div>
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
