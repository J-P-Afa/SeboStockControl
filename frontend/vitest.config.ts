import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 75,
        functions: 60,
        branches: 80,
        statements: 75
      },
      exclude: ['node_modules/**', 'dist/**', '.next/**', '**/*.d.ts', '**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx', 'src/types/**', 'src/lib/api/**', // External API wrappers
        // Radix/Base UI thin wrappers — no business logic
        'src/components/molecules/dropdown-menu.tsx',
        'src/components/molecules/alert-dialog.tsx',
        'src/components/molecules/select.tsx',
        'src/components/molecules/dialog.tsx',
        'src/components/molecules/popover.tsx',
        'src/components/molecules/data-table/index.ts',
        'src/components/organisms/**/index.ts',
      ]
    },
    projects: [{
      extends: true,
      test: {
        name: 'unit',
        environment: 'jsdom',
        globals: true,
        setupFiles: './vitest.setup.ts',
        alias: {
          '@': path.resolve(__dirname, './src')
        },
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/cypress/**',
          '**/.{idea,git,cache,output,temp}/**',
          '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,e2e}.config.*',
          '**/e2e/**',
        ],
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});