import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/__tests__/e2e/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  plugins: [swc.vite({ module: { type: 'es6' } }) as any],
});
