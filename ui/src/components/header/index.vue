<script setup lang="ts">
import Toolbar from 'primevue/toolbar';
import { isDark, toggleDark } from '../../composables/dark';
import Version from '../version/index.vue';
</script>

<template>
  <Toolbar class="b-x-none! b-t-none! b-rd-0!">
    <template #start>
      <span font-bold>Git</span><span font-100>Remap</span>
      <Version />
      <a
        op75
        hover:op100
        text-2xl
        cursor-pointer
        i-carbon-logo-github
        href="https://github.com/duowb/git-remap/tree/next"
        target="_blank"
      />
    </template>
    <template #end>
      <span
        op75
        hover:op100
        text-2xl
        cursor-pointer
        title="切换颜色"
        :class="[{ 'i-carbon-moon': isDark, 'i-carbon:sun': !isDark }]"
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
