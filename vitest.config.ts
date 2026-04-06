import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, 'packages/shared/src') + '/',
      '@/server/': path.resolve(__dirname, 'packages/shared/src/server') + '/',
      '@/shared/': path.resolve(__dirname, 'packages/shared/src/shared') + '/',
      'server-only': path.resolve(__dirname, 'tests/mocks/server-only.ts'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    include: [
      'tests/unit/**/*.test.ts',
    ],
  },
});
