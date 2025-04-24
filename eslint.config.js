import { sxzz } from '@sxzz/eslint-config';

export default sxzz(
  {
    vue: true,
    prettier: true,
    unocss: false
  },
  [
    {
      ignores: ['.prettierrc']
    }
  ]
);
