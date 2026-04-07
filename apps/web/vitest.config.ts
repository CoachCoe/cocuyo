import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/hooks/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/test/**',
        '**/index.ts',
      ],
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 55,
        statements: 55,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@cocuyo/types': resolve(__dirname, '../../packages/types/src'),
      '@cocuyo/ui': resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
