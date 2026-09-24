<script setup lang="ts">
const route = useRoute()

const isRegister = computed(
  () => route.path === '/register' || route.path === '/(auth)/register',
)

const bgImage = computed(() => {
  if (isRegister.value) {
    return '/register-bg.jpg'
  }
  return '/login-bg.jpg'
})

const features = [
  {
    quote: 'CraftCV provides clean, ATS-friendly templates that are genuinely professional. Exporting to PDF is flawless every single time.',
    name: 'Mark Williams',
    role: 'Product Manager | Capsule',
    initials: 'MW',
  },
  {
    quote: 'Managing multiple CV versions for different roles is effortless. The interface is intuitive and gets straight to the point.',
    name: 'Sarah Chen',
    role: 'UX Designer | Figma',
    initials: 'SC',
  },
  {
    quote: 'The template library is excellent. I had my CV looking exactly the way I wanted in under 30 minutes \u2014 no fuss, just results.',
    name: 'James Osei',
    role: 'Software Engineer | Stripe',
    initials: 'JO',
  },
]

const activeSlide = ref(0)
const currentFeature = computed(() => features[activeSlide.value]!)

let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % features.length
  }, 3000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function prevSlide() {
  activeSlide.value = (activeSlide.value - 1 + features.length) % features.length
  startTimer()
}

function nextSlide() {
  activeSlide.value = (activeSlide.value + 1) % features.length
  startTimer()
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col justify-between py-3 sm:py-5 lg:py-6 bg-white px-4 sm:px-8 lg:px-12"
  >
    <header class="hidden lg:block w-full max-w-7xl mx-auto">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5">
        <NuxtImg
          src="/craftcv-logo.png"
          alt="CraftCV"
          class="h-8 w-auto"
        />
        <span
          class="font-display font-semibold text-xl tracking-tight text-stone-900"
        >
          CraftCV
        </span>
      </NuxtLink>
    </header>

    <main
      class="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center py-2 sm:py-4"
    >
      <div
        class="hidden lg:flex lg:w-[40%] flex-shrink-0 h-[min(620px,82vh)] rounded-2xl overflow-hidden p-6 relative bg-stone-900 shadow-xl flex-col justify-end"
      >
        <img
          :src="bgImage"
          alt="CraftCV background"
          class="absolute inset-0 w-full h-full object-cover object-top opacity-90 transition-all duration-500"
        >

        <div
          class="relative z-10 rounded-xl bg-black/60 backdrop-blur-md p-5 border border-white/10 text-white"
        >
          <p class="text-sm font-medium leading-relaxed mb-4 text-stone-100">
            "{{ currentFeature.quote }}"
          </p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-semibold text-white tracking-wider flex-shrink-0"
              >
                {{ currentFeature.initials }}
              </div>
              <div>
                <h4 class="font-semibold text-sm text-white leading-tight">
                  {{ currentFeature.name }}
                </h4>
                <p class="text-xs text-stone-300">
                  {{ currentFeature.role }}
                </p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                aria-label="Previous feature"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                @click="prevSlide"
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
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next feature"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                @click="nextSlide"
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
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[60%] flex items-center justify-center">
        <div class="w-full max-w-[400px] mx-auto">
          <NuxtLink to="/" class="flex flex-col items-center mb-8 lg:hidden">
            <NuxtImg
              src="/craftcv-logo.png"
              alt="CraftCV"
              class="h-8 w-auto"
            />
            <span class="font-display font-semibold text-xl tracking-tight text-stone-900 mt-1">CraftCV</span>
          </NuxtLink>
          <slot />
        </div>
      </div>
    </main>

    <footer
      class="w-full max-w-7xl mx-auto px-6 sm:px-12 text-center text-xs text-stone-400"
    >
      <p>&copy; {{ new Date().getFullYear() }} CraftCV. All rights reserved.</p>
    </footer>
  </div>
</template>
