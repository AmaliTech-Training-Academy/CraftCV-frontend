import { defineVitestConfig } from '@nuxt/test-utils/config'

// Tests run in plain Node by default, which is all the repository-level tests
// in tests/ need. A test that renders a component opts into the Nuxt runtime
// with a `// @vitest-environment nuxt` comment on its first line.
export default defineVitestConfig({
  test: {
    include: [
      'tests/**/*.{test,spec}.ts',
      'app/**/*.{test,spec}.ts',
      'server/**/*.{test,spec}.ts',
    ],
    exclude: ['node_modules/**', '.nuxt/**', '.output/**', 'dist/**'],
    environment: 'node',
    testTimeout: 30_000,
  },
})
