import { fileURLToPath } from 'node:url';

export const uiDistDir = fileURLToPath(new URL('../dist/ui', import.meta.url));
