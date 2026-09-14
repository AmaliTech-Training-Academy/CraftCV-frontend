# CraftCV Frontend

Frontend for CraftCV, a web application that helps individuals build a seamless CV.

The stack is **Nuxt 4** on **Vue 3**, styled with **Tailwind CSS v4** through the
`@tailwindcss/vite` plugin, with **shadcn-nuxt** providing the component
primitives. **ESLint** (via `@nuxt/eslint`) covers linting and formatting,
**Vitest** with `@nuxt/test-utils` runs the unit tests, and **vue-tsc** type
checks the project.

> **Status:** project scaffold only. `app/app.vue` renders a placeholder
> heading. There are no pages, components, layouts, stores or API calls yet, and
> the shadcn CLI has not been initialised, so no `components.json` and no
> generated UI components exist.

## Requirements

- Node.js 20.19 or newer — `.nvmrc` pins the version CI uses
- npm — `package-lock.json` is the lock file this repository tracks

## Getting started

```sh
git clone https://github.com/AmaliTech-Training-Academy/CraftCV-frontend.git
cd CraftCV-frontend
npm install
```

`npm install` runs `nuxt prepare` afterwards, which generates `.nuxt/` including
the TypeScript config `tsconfig.json` points at and the ESLint config
`eslint.config.mjs` extends. Without it the editor reports missing references
and lint fails to start.

Enable the version-controlled Git hooks in `.githooks/` (once per clone). They
enforce the branch and commit conventions, including the `crf-<ticket-number>`
reference every branch name must carry — for example `feat/crf-3-login-page`:

```sh
sh scripts/setup-hooks.sh
```

```powershell
.\scripts\setup-hooks.ps1
```

Start the development server on <http://localhost:3000>:

```sh
npm run dev
```

Nuxt DevTools is enabled, so the toolbar is available in the browser during
development.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 with HMR |
| `npm run build` | Production build into `.output/` |
| `npm run preview` | Serve the production build locally |
| `npm run generate` | Pre-render to static files |
| `npm run lint` | ESLint over the project, formatting included |
| `npm run lint:fix` | The same, applying every fix it can |
| `npm run typecheck` | `vue-tsc` through `nuxt typecheck` |
| `npm test` | Vitest, once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run check` | Every gate, the way CI runs them |
| `npm run postinstall` | `nuxt prepare`; runs automatically after install |

## Project structure

```text
CraftCV-frontend/
├── app/                   # Nuxt source directory (srcDir in Nuxt 4)
│   ├── app.vue            # Root component
│   ├── app.nuxt.test.ts   # Smoke test, rendered in the Nuxt runtime
│   └── assets/css/
│       └── main.css       # Tailwind entry point
├── public/                # Served as-is at the site root
├── scripts/               # check.sh, hook installers, convention checks
├── tests/                 # Repository-level tests (the convention rules)
├── .githooks/             # pre-commit, commit-msg, pre-push
├── .github/workflows/     # CI and repository-standards
├── eslint.config.mjs
├── vitest.config.ts
├── nuxt.config.ts
├── tsconfig.json          # References the configs Nuxt generates in .nuxt/
└── package.json
```

Nuxt 4 puts application code under `app/`, not the project root. Directories it
picks up by convention — `pages/`, `components/`, `layouts/`, `composables/`,
`middleware/`, `plugins/`, `utils/` — belong inside `app/` and are created as
they are needed. Server routes are the exception: `server/` sits at the project
root.

## Styling

Tailwind v4 is wired in as a Vite plugin rather than a Nuxt module. There is no
`tailwind.config.js` and none is expected: v4 is configured from CSS, so theme
tokens, custom variants and plugins go in `app/assets/css/main.css` alongside
the `@import "tailwindcss"` that is already there. That file is registered in
`nuxt.config.ts` under `css`.

## UI components

`shadcn-nuxt` is registered as a module and configured with an empty `prefix`
and `componentDir: "./app/components/ui"`, so components are used by their plain
names (`<Button />`, not `<UiButton />`).

Running the shadcn CLI is still outstanding — it is what writes
`components.json` and adds the first component. Until then the module is
registered but nothing is generated, and Nuxt warns once per run that the
component directory does not exist. The warning goes away with the first
component.

## Quality checks

`scripts/check.sh` is the one command that runs every gate. The Git hooks and
GitHub Actions both call it, so local and CI results cannot drift.

```sh
sh scripts/check.sh lint            # eslint, including formatting
sh scripts/check.sh tests-required  # staged code must ship with a test
sh scripts/check.sh typecheck       # vue-tsc through nuxt typecheck
sh scripts/check.sh test            # vitest unit tests
sh scripts/check.sh build           # nuxt production build
sh scripts/check.sh all             # lint, typecheck, test and build
```

When to expect each one:

| Moment | What runs |
| --- | --- |
| `git commit` | Branch and subject conventions, whitespace, **lint on staged source files**, and **a test alongside any staged application code** |
| `git push` | The same conventions, then **typecheck, unit tests and build** |
| Pull request / push to `main`, `develop` | Lint, typecheck, test and build again in GitHub Actions |

Lint runs on commit because it is fast; the slower gates run once per push. Fix
lint failures with `npm run lint:fix`.

A commit that touches application code without staging a test is rejected. Put
the test beside what it covers as `*.test.ts`, or in `tests/`, and stage it in
the same commit. Configuration files, type declarations, `app/assets/`, and the
shadcn-generated components under `app/components/ui/` are exempt, and so is
anything that is not a source file. When a change genuinely has nothing to
assert, say so out loud with `SKIP_TEST_CHECK=1 git commit`.

For an emergency push, `SKIP_PUSH_CHECKS=1 git push` skips the typecheck, tests
and build — CI still runs them.

## Tests

```sh
npm test
```

Tests run in plain Node by default. A test that renders a component needs the
Nuxt runtime instead, which it opts into with a comment on its first line:

```ts
// @vitest-environment nuxt
```

`app/app.nuxt.test.ts` is the smoke test for the root component and the example
to copy. `tests/` covers the rules the Git hooks enforce: `conventions.test.ts`
for `scripts/validate-conventions.sh` and `check-script.test.ts` for the
tests-required gate. Feature tests belong next to the code they cover.

The two repository-level suites shell out to the scripts themselves rather than
re-implementing the patterns, so they skip automatically on a machine with no
POSIX shell on `PATH`.

## Known gaps

These are tracked as follow-up work and are intentionally listed here so they
are not mistaken for finished configuration:

- No coverage reporting and no threshold.
- No end-to-end tests. `@nuxt/test-utils` supports Playwright; nothing uses it
  yet.
- No accessibility linting.
- No `.env.example`, and no runtime configuration for the backend API base URL.
- No deployment workflow. CI builds the app but nothing publishes it.
- `LICENSE` is an empty placeholder.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit message
format, pull request expectations, and local quality checks.

## Related

The API this frontend consumes is the CraftCV backend: Django and Django REST
Framework, with its OpenAPI schema at `/api/schema/` and Swagger UI at
`/api/swagger/`.
