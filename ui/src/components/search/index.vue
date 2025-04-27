<script setup lang="ts">
import Button from 'primevue/button';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import { ref, shallowRef } from 'vue';
import { getDirHandle, selectFolderAndFindGitProjects, type Project } from '../../utils/git-finder';

const search = ref('');

const loading = defineModel<boolean>('loading', { required: true });

const emits = defineEmits<{
  (e: 'foundProjects', projects: Project[]): void;
}>();

const dirHandle = shallowRef<FileSystemDirectoryHandle | null>(null);

async function handleSelectFolder() {
  loading.value = true;
  if (!dirHandle.value) return;
  const { folderName, projects } = await selectFolderAndFindGitProjects(dirHandle.value);
  search.value = `${folderName}/`;
  emits('foundProjects', projects);
  loading.value = false;
}

async function selectFolder() {
  try {
    dirHandle.value = await getDirHandle();
    await handleSelectFolder();
  } catch (error) {
    console.error('选择路径失败:', error);
  }
}

defineExpose({
  handleSelectFolder
});
</script>

<template>
  <div flex gap-2 w-full>
    <InputGroup class="flex-1">
      <InputText
        v-model="search"
        type="text"
        class="w-full"
        placeholder="请选择路径"
        readonly
        disabled
      />
      <InputGroupAddon>
        <Button
          icon="i-carbon:airplay-filled text-5"
          severity="secondary"
          variant="text"
          :loading="loading"
          @click="selectFolder"
        />
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
