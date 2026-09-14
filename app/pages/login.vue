<template>
  <div class="flex min-h-screen">
      <div
        class="relative hidden md:flex md:w-[70%] flex-shrink-0 bg-brand-900 overflow-hidden rounded-r-[2.5rem] ring-1 ring-brand-700/60"
      >
        <video
          src="/craft-cv animation.mp4"
          autoplay
          loop
          muted
          playsinline
          class="absolute inset-0 w-full h-full object-cover"
        />

        <div class="relative z-10 flex flex-col w-full p-8">
          <div class="flex items-center gap-3">
            <NuxtImg
              src="/craftcv-logo.png"
              alt="CraftCV"
              class="h-10 w-auto mix-blend-multiply"
            />
            <span class="font-display text-stone-900 font-semibold text-xl tracking-tight"
              >CraftCV</span
            >
          </div>
        </div>
      </div>

      <div
        class="flex flex-col justify-center w-full md:w-[55%] bg-white px-8 py-10 sm:px-12"
      >
        <div class="flex items-center justify-center gap-3 mb-8 md:hidden">
          <NuxtImg src="/craftcv-logo.png" alt="CraftCV" class="h-8 w-auto" />
          <span class="font-display text-stone-900 font-semibold text-lg tracking-tight"
            >CraftCV</span
          >
        </div>

        <div class="w-full max-w-sm mx-auto">
          <div class="mb-8 text-center md:text-left">
            <h1
              class="font-display text-4xl font-semibold text-stone-900 leading-tight mb-2"
            >
              Welcome back.
            </h1>
            <p class="text-stone-600 text-sm">
              Enter your email and password to continue.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" novalidate class="space-y-5">
            <div class="space-y-1.5">
              <label
                for="email"
                class="block text-sm font-medium text-stone-800"
                >Email address</label
              >
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                @blur="touch('email')"
                :class="[
                  'w-full rounded-[10px] border bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                  fieldError('email')
                    ? 'border-error focus:ring-2 focus:ring-error/30'
                    : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                ]"
              />
              <p v-if="fieldError('email')" class="text-xs text-error">
                {{ fieldError("email") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label
                for="password"
                class="block text-sm font-medium text-stone-800"
                >Password</label
              >
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  @blur="touch('password')"
                  :class="[
                    'w-full rounded-[10px] border bg-white px-4 py-3 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                    fieldError('password')
                      ? 'border-error focus:ring-2 focus:ring-error/30'
                      : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                  ]"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                    />
                    <path
                      d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
              <p v-if="fieldError('password')" class="text-xs text-error">
                {{ fieldError("password") }}
              </p>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  v-model="form.rememberMe"
                  class="w-4 h-4 rounded border-stone-300 accent-brand-600"
                />
                <span class="text-sm text-stone-600">Remember me</span>
              </label>
              <a
                href="#"
                class="text-sm text-brand-600 hover:text-brand-700 font-medium transition"
                >Forgot password?</a
              >
            </div>

            <div
              v-if="serverError"
              class="flex items-center gap-2 rounded-[10px] bg-error-tint border border-error/20 px-4 py-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="#c9564a"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="0 0 24 24"
                class="flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p class="text-sm text-error">{{ serverError }}</p>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              :disabled="loading"
              class="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-[10px] py-3"
            >
              <svg
                v-if="loading"
                class="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>{{ loading ? "Signing in…" : "Sign in" }}</span>
            </Button>
          </form>

          <p class="mt-8 text-center text-sm text-stone-600">
            Don't have an account?
            <NuxtLink
              to="/register"
              class="text-brand-600 hover:text-brand-700 font-medium transition"
              >Sign up</NuxtLink
            >
          </p>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Sign in — CraftCV",
  meta: [
    {
      name: "description",
      content: "Sign in to your CraftCV account to access your CV dashboard.",
    },
  ],
});

definePageMeta({ layout: false });

const router = useRouter();

const form = reactive({ email: "", password: "", rememberMe: false });
const touched = reactive({ email: false, password: false });
const showPassword = ref(false);
const loading = ref(false);
const serverError = ref("");

function touch(field: "email" | "password") {
  touched[field] = true;
}

function fieldError(field: "email" | "password") {
  if (!touched[field]) return "";
  if (field === "email") {
    if (!form.email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
  }
  if (field === "password") {
    if (!form.password) return "Password is required.";
  }
  return "";
}

function isValid() {
  touched.email = true;
  touched.password = true;
  return !fieldError("email") && !fieldError("password");
}

async function handleSubmit() {
  serverError.value = "";
  if (!isValid()) return;
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 1200));
    if (form.email === "test@craftcv.com" && form.password === "password") {
      const token = btoa(`${form.email}:${Date.now()}`);
      localStorage.setItem("auth_token", token);
      await router.push("/dashboard");
    } else {
      serverError.value = "Invalid email or password.";
    }
  } finally {
    loading.value = false;
  }
}
</script>
