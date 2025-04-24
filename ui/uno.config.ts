import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetMini,
  presetTypography,
  presetWebFonts
} from 'unocss';
export default defineConfig({
  presets: [
    presetMini(),
    presetAttributify(),
    presetTypography(),
    presetWebFonts(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then((i) => i.default),
        'vscode-icons': () => import('@iconify-json/vscode-icons/icons.json').then((i) => i.default)
      }
    })
  ]
});
