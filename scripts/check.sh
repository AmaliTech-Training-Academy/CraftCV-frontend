#!/bin/sh

# Canonical quality gate. The Git hooks and GitHub Actions both call this file,
# so local and CI results cannot drift.
#
#   sh scripts/check.sh lint            eslint over the whole project
#   sh scripts/check.sh lint --staged   the same, on staged source files only
#   sh scripts/check.sh tests-required  staged app code must ship with a test
#   sh scripts/check.sh typecheck       vue-tsc through nuxt typecheck
#   sh scripts/check.sh test            vitest unit tests, once
#   sh scripts/check.sh build           nuxt production build
#   sh scripts/check.sh generate        static site, prerendering every route
#   sh scripts/check.sh all             lint, typecheck, test, build and generate

set -eu

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

fail() {
  printf '%s\n' "$1" >&2
  exit 1
}

command -v node >/dev/null 2>&1 ||
  fail "Node.js is not on PATH. Install Node 20 or newer (see .nvmrc)."

bin_dir="$repo_root/node_modules/.bin"

require_bin() {
  [ -f "$bin_dir/$1" ] && return 0

  cat >&2 <<EOF
Missing dependency: $1 is not installed in node_modules

Install the project dependencies first:

    npm install
EOF
  exit 1
}

# Nuxt writes .nuxt/ during 'nuxt prepare', which npm runs as a postinstall
# step. Linting and type checking both read the config it generates there.
require_prepared() {
  [ -d "$repo_root/.nuxt" ] && return 0

  step 'prepare: generating .nuxt'
  "$bin_dir/nuxt" prepare
}

step() {
  printf '\n[check] %s\n' "$1"
}

lint_help() {
  cat >&2 <<EOF

Lint failed. Most of this is fixable automatically:

    npm run lint:fix

Then stage the result and commit again. Rules come from @nuxt/eslint and are
configured in nuxt.config.ts and eslint.config.mjs.
EOF
}

run_lint() {
  require_bin eslint
  require_prepared

  if [ "${1:-}" = "--staged" ]; then
    staged=$(mktemp)
    # ACMR: added, copied, modified, renamed. Deleted files have nothing to lint.
    git diff --cached --name-only --diff-filter=ACMR -z \
      -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' '*.vue' >"$staged"

    if [ ! -s "$staged" ]; then
      rm -f "$staged"
      step 'lint: no staged source files, skipping'
      return 0
    fi

    step 'lint: eslint (staged files)'
    xargs -0 "$bin_dir/eslint" --no-warn-ignored <"$staged" || {
      rm -f "$staged"
      lint_help
      exit 1
    }

    rm -f "$staged"
    return 0
  fi

  step 'lint: eslint'
  "$bin_dir/eslint" . || { lint_help; exit 1; }
}

run_typecheck() {
  require_bin nuxt
  require_bin vue-tsc

  step 'typecheck: nuxt typecheck'
  "$bin_dir/nuxt" typecheck
}

run_test() {
  require_bin vitest

  step 'test: vitest run'
  "$bin_dir/vitest" run
}

run_build() {
  require_bin nuxt

  step 'build: nuxt build'
  "$bin_dir/nuxt" build
}

# nuxt build produces a server bundle; what nginx serves is the static site.
# Generating it here rather than only in CI is deliberate: the prerenderer
# crawls every link it renders and fails on one that 404s, which is a class of
# break that lint, typecheck and the unit tests all pass straight over.
run_generate() {
  require_bin nuxt

  step 'generate: nuxt generate'
  "$bin_dir/nuxt" generate

  [ -f "$repo_root/.output/public/index.html" ] ||
    fail "generate produced no .output/public/index.html"
}

# A change to these needs no test of its own: generated code, build
# configuration, styling, and type declarations with no behaviour to assert.
test_exempt() {
  case "$1" in
    .nuxt/* | .output/* | dist/*) return 0 ;;
    *.d.ts) return 0 ;;
    app/components/ui/*) return 0 ;;
    app/assets/*) return 0 ;;
    nuxt.config.ts | vitest.config.ts | eslint.config.mjs) return 0 ;;
    app/app.config.ts) return 0 ;;
  esac
  return 1
}

is_test_file() {
  case "$1" in
    tests/* | */tests/* | __tests__/* | */__tests__/*) return 0 ;;
    *.test.ts | *.test.js | *.spec.ts | *.spec.js) return 0 ;;
    *.test.tsx | *.spec.tsx) return 0 ;;
  esac
  return 1
}

# Fails when application code is staged without a test alongside it. Pass paths
# to check an explicit list; with no arguments the staged files are used.
run_tests_required() {
  if [ "${SKIP_TEST_CHECK:-0}" = "1" ]; then
    step 'tests-required: skipped by SKIP_TEST_CHECK=1'
    return 0
  fi

  if [ "$#" -eq 0 ]; then
    set -- $(git diff --cached --name-only --diff-filter=ACMR \
      -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.mjs' '*.cjs' '*.vue')
  fi

  untested=''
  saw_test=0

  for path in "$@"; do
    case "$path" in
      *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.vue) ;;
      *) continue ;;
    esac

    if is_test_file "$path"; then
      saw_test=1
      continue
    fi

    test_exempt "$path" && continue

    untested="$untested  $path
"
  done

  if [ -z "$untested" ] || [ "$saw_test" -eq 1 ]; then
    step 'tests-required: ok'
    return 0
  fi

  cat >&2 <<EOF

Application code is staged with no test in the same commit:

$untested
Every behaviour change needs a unit test. Add or update one of:

  app/**/*.test.ts        beside the component or composable it covers
  tests/*.test.ts         repository-level tests

Then stage it and commit again. Run the suite with:

    sh scripts/check.sh test

If this change genuinely has nothing to assert, say so explicitly:

    SKIP_TEST_CHECK=1 git commit ...

See CONTRIBUTING.md.
EOF
  exit 1
}

[ "$#" -ge 1 ] ||
  fail "Usage: $0 lint [--staged] | tests-required [path...] | typecheck | test | build | generate | all"

case "$1" in
  lint) shift; run_lint "$@" ;;
  tests-required) shift; run_tests_required "$@" ;;
  typecheck) run_typecheck ;;
  test) run_test ;;
  build) run_build ;;
  generate) run_generate ;;
  all) run_lint; run_typecheck; run_test; run_build; run_generate ;;
  *) fail "Unknown check '$1'. Use lint, tests-required, typecheck, test, build, generate, or all." ;;
esac
