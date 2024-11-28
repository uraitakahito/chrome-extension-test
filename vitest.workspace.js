// If present, vitest will read your root `vite.config.ts`
// https://vitest.dev/guide/#configuring-vitest

// https://vitest.dev/guide/workspace
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineWorkspace } from 'vitest/config';

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  {
    test: {
      environment: 'node',
      globals: true,
      include: ['{test,test-vitest}/**/*.test.{ts,js}'],
      name: 'node',
      // setupFiles: ['./setup.init.js'],
    },
  },
]);
