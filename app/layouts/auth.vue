<script setup lang="ts">
const route = useRoute()

const isRegister = computed(() => route.path === '/register' || route.path === '/auth/register')

const bgImage = computed(() => {
  if (isRegister.value) {
    return '/register-bg.jpg'
  }
  return '/login-bg.jpg'
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between py-3 sm:py-5 lg:py-6 bg-white px-4 sm:px-8 lg:px-12">
    <!-- Top Bar Header with CraftCV logo -->
    <header class="w-full max-w-7xl mx-auto px-6 sm:px-12">
      <div class="inline-flex items-center gap-2.5">
        <NuxtImg
          src="/craftcv-logo.png"
          alt="CraftCV"
          class="h-8 w-auto"
        />
        <span class="font-display font-semibold text-xl tracking-tight text-stone-900">
          CraftCV
        </span>
      </div>
    </header>

    <!-- Parent container with items-center justify-center -->
    <main class="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center py-2 sm:py-4">
      <!-- Testimonial Image Panel on the LEFT (w-[40%], flex-shrink-0, hidden <1024px) -->
      <div
        class="hidden lg:flex lg:w-[40%] flex-shrink-0 h-[min(620px,82vh)] rounded-2xl overflow-hidden p-6 relative bg-stone-900 shadow-xl flex-col justify-end"
      >
        <img
          :src="bgImage"
          alt="CraftCV background"
          class="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-all duration-500"
        >

        <!-- Testimonial Overlay Card -->
        <div
          class="relative z-10 rounded-xl bg-black/60 backdrop-blur-md p-5 border border-white/10 text-white"
        >
          <p class="text-sm font-medium leading-relaxed mb-4 text-stone-100">
            “CraftCV is my go-to website for all my CVs. I get free high-quality CVs, what more could I ask for?”
          </p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-semibold text-white tracking-wider flex-shrink-0"
              >
                MW
              </div>
              <div>
                <h4 class="font-semibold text-sm text-white leading-tight">
                  Mark Williams
                </h4>
                <p class="text-xs text-stone-300">
                  Product Manager | Capsule
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Next testimonial"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-4 h-4 text-white"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Registration Form Container on the RIGHT (w-[60%], centered content) -->
      <div
        class="w-full lg:w-[60%] flex items-center justify-center px-6 sm:px-12"
      >
        <div class="w-full max-w-[400px]">
          <slot />
        </div>
      </div>
    </main>

    <!-- Footer for vertical balance -->
    <footer class="w-full max-w-7xl mx-auto px-6 sm:px-12 text-center text-xs text-stone-400">
      <p>&copy; {{ new Date().getFullYear() }} CraftCV. All rights reserved.</p>
    </footer>
  </div>
</template>
