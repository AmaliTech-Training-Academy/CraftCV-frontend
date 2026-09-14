import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export interface ShellResult {
  status: number
  stdout: string
  stderr: string
}

// A POSIX shell ships with Git for Windows, but it is not always on PATH.
export const hasPosixShell = spawnSync('sh', ['-c', 'exit 0']).error === undefined

export function runShell(
  script: string,
  args: string[],
  env: NodeJS.ProcessEnv = {},
): ShellResult {
  const result = spawnSync('sh', [resolve(repoRoot, script), ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })

  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}
