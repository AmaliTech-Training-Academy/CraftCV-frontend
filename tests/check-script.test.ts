// Tests for the tests-required gate in scripts/check.sh.
//
// The pre-commit hook calls it to reject a behaviour change that arrives
// without a test, so the rule about which paths count as source and which
// count as tests is worth pinning down.

import { describe, expect, it } from 'vitest'
import { hasPosixShell, runShell, type ShellResult } from './shell'

const SCRIPT = 'scripts/check.sh'

function runCheck(paths: string[], env: NodeJS.ProcessEnv = {}): ShellResult {
  return runShell(SCRIPT, ['tests-required', ...paths], { SKIP_TEST_CHECK: '0', ...env })
}

function expectAllowed(paths: string[], env: NodeJS.ProcessEnv = {}): ShellResult {
  const result = runCheck(paths, env)
  expect(result.status, `expected ${paths.join(' ')} to be allowed\n${result.stderr}`).toBe(0)
  return result
}

function expectBlocked(paths: string[]): ShellResult {
  const result = runCheck(paths)
  expect(result.status, `expected ${paths.join(' ')} to be blocked\n${result.stdout}`).toBe(1)
  return result
}

describe.skipIf(!hasPosixShell)('source without a test', () => {
  it.each([
    'app/pages/login.vue',
    'app/components/CvPreview.vue',
    'app/composables/useCvDraft.ts',
    'app/utils/format-date.ts',
    'server/api/cv.post.ts',
  ])('blocks %s on its own', (path) => {
    expectBlocked([path])
  })

  it('allows a source change that brings a test', () => {
    expectAllowed(['app/pages/login.vue', 'app/pages/login.nuxt.test.ts'])
    expectAllowed(['app/composables/useCvDraft.ts', 'tests/use-cv-draft.test.ts'])
    expectAllowed(['app/utils/format-date.ts', 'app/utils/format-date.spec.ts'])
  })

  it('lets one test cover several source files', () => {
    expectAllowed([
      'app/composables/useCvDraft.ts',
      'app/utils/format-date.ts',
      'tests/cv-draft.test.ts',
    ])
  })

  it.each([
    'app/utils/format-date.test.ts',
    'app/utils/format-date.spec.ts',
    'tests/conventions.test.ts',
    'app/__tests__/format-date.test.ts',
  ])('counts %s as a test', (path) => {
    expectAllowed(['app/utils/format-date.ts', path])
  })
})

describe.skipIf(!hasPosixShell)('exempt paths', () => {
  it.each([
    'nuxt.config.ts',
    'vitest.config.ts',
    'eslint.config.mjs',
    'app/app.config.ts',
    'app/components/ui/button.vue',
    'app/assets/css/main.css.ts',
    'shared/types/cv.d.ts',
  ])('needs no test for %s', (path) => {
    expectAllowed([path])
  })

  it('needs no test for a non-source change', () => {
    expectAllowed(['README.md', 'package.json', '.githooks/pre-commit'])
  })

  it('allows a commit with nothing staged', () => {
    expectAllowed([])
  })
})

describe.skipIf(!hasPosixShell)('escape hatch', () => {
  it('lets SKIP_TEST_CHECK=1 through', () => {
    const result = expectAllowed(['app/pages/login.vue'], { SKIP_TEST_CHECK: '1' })

    expect(result.stdout).toContain('SKIP_TEST_CHECK=1')
  })
})

describe.skipIf(!hasPosixShell)('rejection message', () => {
  it('names the files and the way out', () => {
    const { stderr } = expectBlocked(['app/pages/login.vue', 'app/utils/format-date.ts'])

    expect(stderr).toContain('app/pages/login.vue')
    expect(stderr).toContain('app/utils/format-date.ts')
    expect(stderr).toContain('app/**/*.test.ts')
    expect(stderr).toContain('SKIP_TEST_CHECK=1')
    expect(stderr).toContain('CONTRIBUTING.md')
  })
})
