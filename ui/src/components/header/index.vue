<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import { version } from '../../../package.json';
import { isDark, toggleDark } from '../../composables/dark';
</script>

<template>
  <Toolbar class="b-x-none! b-t-none! b-rd-0!">
    <template #start>
      <span font-bold>Git</span><span font-100>Remap</span><sup op50>v{{ version }}</sup>
    </template>
    <template #end>
      <span
        op75
        hover:op100
        title="切换颜色"
        :class="['text-2xl cursor-pointer', { 'i-carbon-moon': isDark, 'i-carbon:sun': !isDark }]"
        @click="toggleDark"
      />
    </template>
  </Toolbar>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2147483646;
}
.dark::view-transition-old(root) {
  z-index: 2147483646;
}
.dark::view-transition-new(root) {
  z-index: 1;
}
</style>
