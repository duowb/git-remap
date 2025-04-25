import { useFetch } from '@vueuse/core';
import { ref } from 'vue';
import { version } from '../../../package.json';

export function useCheckVersion() {
  const isNewVersion = ref(false);
  const currentVersion = ref(version);
  const latestVersion = ref(version);
  useFetch('https://registry.npmjs.org/git-remap')
    .json()
    .then(({ data }) => {
      latestVersion.value = data.value['dist-tags'].latest;
      if (compareVersion(latestVersion.value, version) === 1) {
        isNewVersion.value = true;
      }
    });

  return {
    currentVersion,
    latestVersion,
    isNewVersion
  };
}

function compareVersion(version1: string, version2: string) {
  const v1 = version1.split('.');
  const v2 = version2.split('.');
  const maxLength = Math.max(v1.length, v2.length);
  while (v1.length < maxLength) {
    v1.push('0');
  }
  while (v2.length < maxLength) {
    v2.push('0');
  }
  for (let i = 0; i < maxLength; i++) {
    const num1 = Number.parseInt(v1[i]);
    const num2 = Number.parseInt(v2[i]);
    if (num1 > num2) {
      return 1;
    }
    if (num1 < num2) {
      return -1;
    }
  }
  return 0;
}
