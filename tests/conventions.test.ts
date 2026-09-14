// Tests for scripts/validate-conventions.sh.
//
// The Git hooks and the repository-standards workflow both delegate to that
// script, so these cases pin down exactly which branch names and commit
// subjects the project accepts. They shell out to the script itself rather
// than re-implementing the patterns, which would only test a copy of the rules.

import { describe, expect, it } from 'vitest'
import { hasPosixShell, runShell, type ShellResult } from './shell'

const SCRIPT = 'scripts/validate-conventions.sh'

function validate(...args: string[]): ShellResult {
  return runShell(SCRIPT, args)
}

function expectAccepted(...args: string[]): ShellResult {
  const result = validate(...args)
  expect(result.status, `expected ${args.join(' ')} to be accepted\n${result.stderr}`).toBe(0)
  return result
}

function expectRejected(...args: string[]): ShellResult {
  const result = validate(...args)
  expect(result.status, `expected ${args.join(' ')} to be rejected\n${result.stdout}`).toBe(1)
  return result
}

describe.skipIf(!hasPosixShell)('branch names', () => {
  const valid = [
    'feat/crf-3-login-page',
    'fix/crf-42-cv-preview-overflow',
    'chore/crf-7-bump-nuxt',
    'docs/crf-1-readme',
    'hotfix/crf-9-a',
    'release/crf-100-v1-0-0',
    'refactor/crf-15-split-cv-store-2',
  ]

  const invalid: Record<string, string> = {
    'feat/login-page': 'no ticket reference',
    'feat/crf-3': 'no description',
    'feat/crf3-login': 'no hyphen after the ticket key',
    'feat/crf-x-login': 'ticket number is not a number',
    'feat/crf-3-Login-Page': 'uppercase',
    'feat/crf-3-login_page': 'underscore',
    'feature/crf-3-login': 'type is not allowed',
    'crf-3-login': 'no type',
    'feat/crf-3-': 'trailing hyphen',
    'feat//crf-3-login': 'empty segment',
    '': 'empty branch name',
  }

  it.each(valid)('accepts %s', (branch) => {
    expectAccepted('branch', branch)
  })

  it.each(Object.entries(invalid))('rejects %s (%s)', (branch) => {
    expectRejected('branch', branch)
  })

  it.each(['main', 'develop'])('exempts the protected branch %s', (branch) => {
    expectAccepted('branch', branch)
  })

  it('explains the format with examples when it rejects', () => {
    const { stderr } = expectRejected('branch', 'feat/login')

    expect(stderr).toContain('<type>/crf-<ticket-number>-<short-kebab-case-description>')
    expect(stderr).toContain('feat/crf-3-login-page')
    expect(stderr).toContain('git branch -m')
    expect(stderr).toContain('CONTRIBUTING.md')
  })
})

describe.skipIf(!hasPosixShell)('commit subjects', () => {
  const valid = [
    'feat(auth): add the login form',
    'fix: stop the preview pane from overflowing',
    'docs: document local setup',
    'feat(api)!: drop the v1 client',
    'chore(deps/nuxt): bump to 4.5.2',
    'revert: feat(auth): add the login form',
  ]

  const invalid: Record<string, string> = {
    'added login': 'no type',
    'Feat: add login': 'type is not lowercase',
    'feat add login': 'no colon',
    'feat:add login': 'no space after the colon',
    'feature: add login': 'type is not allowed',
    'feat: ': 'no description',
    'feat(): add login': 'empty scope',
    '': 'empty subject',
  }

  it.each(valid)('accepts %s', (subject) => {
    expectAccepted('commit', subject)
  })

  it.each(Object.entries(invalid))('rejects %s (%s)', (subject) => {
    expectRejected('commit', subject)
  })

  it('exempts git-generated subjects', () => {
    expectAccepted('commit', 'Merge pull request #4 from org/branch')
    expectAccepted('commit', 'Revert "feat: add login"')
  })

  it('limits the subject to 72 characters', () => {
    const prefix = 'feat: '
    const atLimit = prefix + 'x'.repeat(72 - prefix.length)

    expectAccepted('commit', atLimit)
    const { stderr } = expectRejected('commit', `${atLimit}x`)

    expect(stderr).toContain('73 characters')
    expect(stderr).toContain('limit is 72')
  })

  it('explains the format with examples when it rejects', () => {
    const { stderr } = expectRejected('commit', 'added login')

    expect(stderr).toContain('<type>(optional-scope): <description>')
    expect(stderr).toContain('feat(auth): add the login form')
    expect(stderr).toContain('git commit --amend')
    expect(stderr).toContain('CONTRIBUTING.md')
  })
})

describe.skipIf(!hasPosixShell)('is-protected', () => {
  it.each(['main', 'develop'])('exits zero for %s', (branch) => {
    expectAccepted('is-protected', branch)
  })

  it.each(['feat/crf-1-thing', 'mainline', 'develop-2', ''])(
    'exits non-zero for %s',
    (branch) => {
      expectRejected('is-protected', branch)
    },
  )
})

describe.skipIf(!hasPosixShell)('usage', () => {
  it('reports usage when arguments are missing', () => {
    const result = validate()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Usage:')
  })

  it('rejects an unknown validation type', () => {
    const result = validate('branchname', 'feat/crf-1-thing')

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Unknown validation type')
  })
})
