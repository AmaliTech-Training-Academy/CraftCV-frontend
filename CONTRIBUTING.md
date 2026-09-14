# Contributing

## Branches

Create work from an up-to-date `develop` branch. Do not commit directly to
`main` or `develop`. Every branch must reference its ticket, using this format:

```text
<type>/crf-<ticket-number>-<short-kebab-case-description>
```

Allowed types:

| Type | Use |
| --- | --- |
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Internal change with no behavior change |
| `test` | Test-only change |
| `chore` | Maintenance |
| `build` | Build or dependency change |
| `ci` | CI/CD change |
| `perf` | Performance improvement |
| `hotfix` | Urgent production fix |
| `release` | Release preparation |

Examples: `feat/crf-3-login-page`, `fix/crf-42-cv-preview-overflow`,
`chore/crf-7-bump-nuxt`.

Use lowercase letters and numbers, separated by hyphens. The ticket key `crf`
and its number come first, followed by a short description — a bare
`feat/crf-12` is rejected. Keep a branch focused on one concern and delete it
after merge.

The branch name is checked when you commit and again when you push; a push from
a branch without a ticket reference fails with an example-driven error.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) with an
imperative, concise subject:

```text
<type>(optional-scope): <description>
```

Examples:

```text
feat(auth): add the login form
fix: stop the preview pane from overflowing
docs: document local setup
```

Allowed commit types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`,
`test`, `build`, `ci`, `chore`, and `revert`. Use `fix` for hotfix commits and
`chore` for release preparation. Add `!` before the colon for a breaking change,
and explain it in the commit body. Commit subjects must be no more than 72
characters. Keep commits small, buildable, and free of unrelated formatting.

## Pull requests

- Use a Conventional Commit title; squash-merging will make it the final commit
  subject, and nothing in CI checks it for you. GitHub titles a pull request
  from the branch name by default, so this almost always needs editing.
- Explain what changed, why it changed, and how it was tested.
- Include before and after screenshots for any visible change.
- Link the relevant issue and call out breaking changes.
- Keep pull requests focused and request review only after checks pass.
- Prefer squash merge into `develop`; never force-push `main` or `develop`.

## Local quality checks

Run `sh scripts/setup-hooks.sh` or `.\scripts\setup-hooks.ps1` once per clone.
Three hooks then run automatically:

| Hook | Checks |
| --- | --- |
| `pre-commit` | Blocks commits on `main` and `develop`, validates the current branch name, runs Git's whitespace/error checks, **lints the staged source files**, and **requires a test alongside staged application code** |
| `commit-msg` | Validates the commit subject |
| `pre-push` | Re-validates the branch name and every commit subject being pushed, then runs the **type checker, the unit tests, and the build** |

Lint runs on commit because it is fast. The slower gates run once per push
instead, through the same entry point CI uses:

```sh
sh scripts/check.sh lint            # eslint, including formatting
sh scripts/check.sh lint --staged   # the same, on staged files only
sh scripts/check.sh tests-required  # staged code must ship with a test
sh scripts/check.sh typecheck       # vue-tsc through nuxt typecheck
sh scripts/check.sh test            # vitest unit tests
sh scripts/check.sh build           # nuxt production build
sh scripts/check.sh all
```

Run `npm install` first or the hooks stop with instructions. Lint failures are
mostly fixable with `npm run lint:fix`. `SKIP_PUSH_CHECKS=1 git push` skips the
type check, tests and build for an emergency push; CI still runs them.

`pre-push` is the backstop: a branch missing its `crf-<number>` ticket
reference, or a commit subject that skipped `commit-msg` via `--no-verify`,
fails there before it reaches the remote. Pushes of `main` and `develop`, and
branch deletions, are not blocked. Every rule lives in
`scripts/validate-conventions.sh`, which prints correct and incorrect examples
on failure; change the `ticket_key` variable there if the project key changes.

Hooks improve local feedback but can be bypassed. The GitHub workflows repeat
every check: `repository-standards` for the conventions and `CI` for lint,
typecheck, test, and build. Repository administrators should also protect the
default branch by requiring pull requests, approvals, and the
`repository-standards`, `lint`, `typecheck`, `test`, and `build` status checks,
and by blocking force pushes and deletion.

## Tests come with the change

A commit that stages application code without staging a test is rejected. Put
the test next to what it covers as `*.test.ts` or `*.spec.ts`, or in `tests/`
for repository-level rules, and stage it in the same commit.

A test that renders a component needs the Nuxt runtime. Opt into it with a
comment on the first line and mount with `mountSuspended`, as
`app/app.nuxt.test.ts` does:

```ts
// @vitest-environment nuxt
```

Everything else runs in plain Node, which is faster.

Exempt, because there is no behaviour to assert: `nuxt.config.ts`,
`vitest.config.ts`, `eslint.config.mjs`, `app/app.config.ts`, `*.d.ts`,
`app/assets/`, the shadcn-generated components under `app/components/ui/`, and
every non-source file.

The gate looks at file names, not at coverage, so it cannot tell a real test
from an empty one. It is a reminder, not a substitute for review: a reviewer
should still ask whether the test asserts the behaviour that changed. When a
change genuinely has nothing to assert, make that a deliberate, visible choice:

```sh
SKIP_TEST_CHECK=1 git commit
```

## The stack

Nuxt 4 on Vue 3, Tailwind CSS v4, and shadcn-nuxt. Tooling that is in place:

- **ESLint** through `@nuxt/eslint`, with its stylistic rules on, so one tool
  covers both linting and formatting. There is no Prettier. Configured in
  `nuxt.config.ts` and `eslint.config.mjs`.
- **Vitest** with `@nuxt/test-utils` for unit tests, in Node by default and in
  the Nuxt runtime where a test needs it.
- **vue-tsc** through `nuxt typecheck`.
- **`scripts/check.sh`** as the single entry point for every gate, used by the
  hooks and by CI.
- `.editorconfig` and `.gitattributes` so editors and line endings agree across
  machines.

Still open, for whoever picks them up:

1. Coverage reporting and a threshold.
2. End-to-end tests. `@nuxt/test-utils` supports Playwright; nothing uses it
   yet.
3. Accessibility linting (`eslint-plugin-vuejs-accessibility`).
4. A deployment workflow. CI builds the app but nothing publishes it.

Anything added to the quality gates belongs in `scripts/check.sh` so that the
hooks and CI stay in step.
