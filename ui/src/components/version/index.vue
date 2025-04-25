<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { useCheckVersion } from '../../composables/version';

const { currentVersion, latestVersion, isNewVersion } = useCheckVersion();
const visible = ref(false);

function open() {
  if (!isNewVersion.value) return;
  visible.value = true;
}
</script>

<template>
  <sup op50 cursor-pointer @click="open">
    v{{ currentVersion }}<span v-if="isNewVersion" ml-1 color-blue-500>新版本</span>
  </sup>

  <Dialog v-model:visible="visible" modal header="新版本" :style="{ width: '30rem' }">
    <div flex="~ col gap-2">
      <div flex="~ row gap-2" text-sm>
        <span>当前版本：</span>
        <code>v{{ currentVersion }}</code>
      </div>
      <div flex="~ row gap-2" text-sm>
        <span>最新版本：</span>
        <code>v{{ latestVersion }}</code>
        <a href="https://github.com/duowb/git-remap/releases" target="_blank" class="text-blue-500">
          查看更新日志
        </a>
      </div>
      <div flex="~ row gap-2" text-sm>
        <span>更新方法：</span>
        <code>npm install -g git-remap@latest</code>
      </div>
    </div>
  </Dialog>
</template>
