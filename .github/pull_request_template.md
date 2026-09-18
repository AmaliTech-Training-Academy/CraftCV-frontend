## What changed?

Implements the complete **Forgot / Reset Password** flow (`CRF-37` & `CRF-38`) as a single, self-contained page at `app/pages/(auth)/forgot-password.vue`. The page is split into three sequential steps, each guarded by client-side validation before the user can advance.

### Step 1 — Email
- User enters the email address linked to their account.
- A custom RFC-5321-compatible validator checks for missing `@`, multiple `@` symbols, invalid TLD, consecutive dots, leading/trailing dots, and common formatting mistakes — each with a distinct, human-readable error message.
- The error is shown inline beneath the field with a stable `min-height` container so the layout never jumps.
- Error clears live as the user corrects it; re-validates on blur.

### Step 2 — OTP Verification
- A 6-box digit input built from individual `<input>` elements for full keyboard control:
  - Typing a digit auto-advances focus to the next box.
  - Backspace on an empty box moves focus back and clears the previous box.
  - Pasting a 6-digit code fills all boxes at once and focuses the next empty position.
  - Fixed TypeScript error: `numbers[i] ?? ''` ensures array index access always yields `string`, not `string | undefined`.
- **Resend logic:**
  - 60-second cooldown timer starts automatically when the step mounts (via a `watch`).
  - Maximum of 3 resend attempts; after that the button is replaced with "Try a different email".
  - "Code sent!" flash message appears for 3 seconds after each resend.
  - A `sr-only` `aria-live="polite"` region announces resend state changes to screen readers.

### Step 3 — New Password
- New password field with a show/hide toggle (`Eye` / `EyeOff`).
- **Live password rule checklist** (appears only when the field has content):
  - At least 8 characters
  - Contains an uppercase letter (A–Z)
  - Contains a lowercase letter (a–z)
  - Contains a number (0–9)
  - Contains a special character
  - No common words or repeated sequences
  - Each rule shows a green check or a grey dot in real time.
  - A colour-coded strength badge (`Weak` / `Fair` / `Good` / `Strong`) updates dynamically.
- Confirm password field with live mismatch detection (`aria-invalid`, `role="alert"`).
- Submit button is disabled while passwords do not match.

### Success Modal
- Shown immediately after a valid password reset submission.
- Contains: `ShieldCheck` icon in a green gradient circle, "Password reset!" heading, descriptive message with a live countdown (`5…4…3…2…1s`), and a "Go to login" button.
- Auto-redirects to `/auth/login` after 5 seconds via `setInterval`.
- "Go to login" skips the countdown and redirects immediately.
- Uses `<Teleport to="body">` so the overlay sits above all page content.
- Fully accessible: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`.
- `setInterval` is cleared in `onUnmounted` to prevent memory leaks.

### Shared UI Primitives
Scaffolded via `shadcn-vue` (New York style, Stone base, CSS variables):
- `Button.vue` — variants: `default`, `outline`, `ghost`, `link`, `destructive`, `secondary`.
- `Input.vue` — base text input with consistent focus ring.
- `Label.vue` — accessible form label.
- `Checkbox.vue` — radix-based accessible checkbox.
- `Separator.vue` — horizontal/vertical divider.
- `app/lib/utils.ts` — `cn()` helper (`clsx` + `tailwind-merge`).

### Step Indicator
- Semantic `<nav aria-label="Progress"> > <ol>` with `aria-current="step"` on the active step.
- Three-segment progress bar beneath the `<ol>` (orange = active, green = done, grey = future), hidden from assistive tech with `aria-hidden="true"`.

### Dependencies added
| Package | Version | Purpose |
|---|---|---|
| `shadcn-nuxt` | latest | Nuxt module for shadcn-vue |
| `@lucide/vue` | `^1.46.0` | Icon set (Mail, KeyRound, Eye, EyeOff, ShieldCheck, etc.) |
| `reka-ui` | `^2.10.4` | Headless UI primitives for shadcn-vue |
| `class-variance-authority` | `^0.7.1` | Variant-based component styling |
| `clsx` + `tailwind-merge` | latest | Conditional class merging |
| `@vueuse/core` | `^14.4.0` | Vue composition utilities |
| `tw-animate-css` | `^1.4.0` | Tailwind animation utilities |

### Config changes
- `nuxt.config.ts` — added `shadcn-nuxt` to modules, registered Inter + Poppins Google Fonts via `<link>` preconnects.
- `components.json` — shadcn-vue config (style, aliases, icon library, Tailwind CSS path).
- `pnpm-workspace.yaml` — workspace config added.
- `app/assets/css/main.css` — Tailwind `@layer base` CSS variables for the design token system.
- `@nuxt/eslint` and `@nuxt/test-utils/module` temporarily commented out of modules pending package install (noted inline with restoration instructions).

### Routing
- Forgot-password page moved to the `(auth)` route group at `app/pages/(auth)/forgot-password.vue` so it inherits any future auth layout without affecting the URL.
- `app/pages/index.vue` placeholder added.

## How was it tested?

**Automated — `npx vitest run` · 3 test files · 69 tests · all passed (7.36 s)**

**`tests/conventions.test.ts`** — pins `scripts/validate-conventions.sh` which is called by both the Git hooks and the CI quality-gate workflow.

| Suite | Cases |
|---|---|
| Branch names — valid | `feat/crf-3-login-page`, `fix/crf-42-…`, `chore/…`, `docs/…`, `hotfix/…`, `release/…`, `refactor/…` |
| Branch names — invalid | No ticket ref, no description, no hyphen after ticket key, non-numeric ticket, uppercase, underscore, unsupported type, no type prefix, trailing hyphen, empty segment, empty string |
| Branch names — protected | `main` and `develop` always accepted |
| Branch name rejection message | Includes format pattern, example, `git branch -m`, and `CONTRIBUTING.md` link |
| Commit subjects — valid | Conventional-commit types with/without scope, breaking `!`, `revert:` prefix, `chore(deps/…)` |
| Commit subjects — invalid | No type, uppercase type, no colon, no space after colon, unsupported type, empty description, empty scope, empty string |
| Commit subjects — exempt | Git-generated (`Merge pull request …`, `Revert "…"`) |
| Commit subject length | Accepts exactly 72 chars; rejects 73 with character-count message |
| Commit rejection message | Includes format pattern, example, `git commit --amend`, and `CONTRIBUTING.md` link |
| `is-protected` | `main`/`develop` → exit 0; all others → exit 1 |
| Usage / unknown type | Missing args → shows `Usage:`; unknown mode → `Unknown validation type` |

**`tests/check-script.test.ts`** — pins the `tests-required` gate in `scripts/check.sh` (called by the pre-commit hook).

| Suite | Cases |
|---|---|
| Source without a test — blocked | `app/pages/*.vue`, `app/components/…`, `app/composables/…`, `app/utils/…`, `server/api/…` |
| Source with a matching test — allowed | `.nuxt.test.ts`, `tests/*.test.ts`, `*.spec.ts` co-located |
| One test covering multiple source files | Single test file satisfies multiple staged source paths |
| Test file patterns recognised | `*.test.ts`, `*.spec.ts`, `tests/…`, `app/__tests__/…` |
| Exempt paths (no test needed) | Config files (`nuxt.config.ts`, `vitest.config.ts`, `eslint.config.mjs`), `components/ui/**`, type declarations, CSS, non-source (`README.md`, `package.json`, `.githooks/…`) |
| Empty staged set | Always allowed |
| `SKIP_TEST_CHECK=1` escape hatch | Allowed, with advisory message printed to stdout |
| Rejection message | Lists blocked files, shows accepted test glob, shows `SKIP_TEST_CHECK=1`, links `CONTRIBUTING.md` |

**`app/app.nuxt.test.ts`** — Nuxt component smoke test.

| Test | Notes |
|---|---|
| `app.vue > renders` | Mounts the root component with `@nuxt/test-utils`; passes. Router warning for `/auth/login` is expected — that route does not exist yet. |

---

**Manual verification (browser — `npm run dev`):**

| Scenario | Result |
|---|---|
| Step 1: Empty submit | Error: "Email address is required." |
| Step 1: No `@` | Error: "Email address must include an @ symbol." |
| Step 1: Invalid TLD (< 2 chars) | Correct error shown |
| Step 1: Valid email | Advances to Step 2 |
| Step 2: Typing digits | Focus auto-advances between boxes |
| Step 2: Backspace on empty box | Focus moves back, previous box cleared |
| Step 2: Paste `123456` | All boxes filled, last focused |
| Step 2: Resend button | Cooldown timer counts down, "Code sent!" flash shown |
| Step 2: 3 resends | Button replaced with "Try a different email" |
| Step 2: Verify | Advances to Step 3 |
| Step 3: Password typed | Rule checklist updates live |
| Step 3: Confirm mismatch | "Passwords do not match" error, submit disabled |
| Step 3: Matching passwords | Submit enabled |
| Step 3: Reset password click | Success modal appears |
| Modal: countdown | `5 → 4 → 3 → 2 → 1` ticks every second |
| Modal: auto-redirect | Navigates to `/auth/login` at `0s` |
| Modal: "Go to login" button | Immediate navigation, interval cleared |
| Step indicator | Correct colours at each step transition |

## Screenshots

<!-- Add before/after screenshots here. Delete this section if not applicable. -->

## Checklist

- [x] The branch and PR title follow `CONTRIBUTING.md`.
- [x] The change is focused and contains no unrelated work.
- [x] Tests and documentation were added or updated where needed.
- [x] Breaking changes and deployment steps are called out.
