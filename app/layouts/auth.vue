<script setup lang="ts">
const route = useRoute()

const isRegister = computed(() => route.path === '/auth/register')

const bgImage = computed(() => {
  if (isRegister.value) {
    return '/register-bg.jpg'
  }
  return '/login-bg.jpg'
})

const logoTextColor = computed(() => {
  return 'text-white'
})

const testimonialTitle = computed(() => {
  return isRegister.value
    ? 'Build a CV That Gets You Hired'
    : 'Your Professional Dashboard Awaits'
})

const testimonialBody = computed(() => {
  return isRegister.value
    ? 'Join CraftCV to unlock premium, ATS-optimized templates and intelligent formatting tools. Craft a tailored resume that highlights your unique strengths, track multiple CV versions for different roles, and export pixel-perfect PDFs in seconds.'
    : 'Log back in to securely access your saved resumes and cover letters. From your dashboard, you can quickly duplicate existing CVs to tailor them for new applications, tweak your designs, and download high-quality PDFs instantly.'
})
</script>

<template>
  <div class="flex min-h-screen">
    <div
      class="relative hidden md:flex md:w-[70%] flex-shrink-0 bg-stone-100 overflow-hidden rounded-r-[2.5rem] ring-1 ring-stone-200"
    >
      <img
        :src="bgImage"
        alt="CraftCV background"
        class="absolute inset-0 w-full h-full object-cover transition-all duration-500"
      >

      <div
        class="relative z-10 flex flex-col justify-between w-full h-full p-10"
      >
        <div class="flex items-center gap-3">
          <NuxtImg
            src="/craftcv-logo.png"
            alt="CraftCV"
            class="h-10 w-auto mix-blend-multiply brightness-0 invert"
          />
          <span
            class="font-display font-semibold text-xl tracking-tight transition-colors"
            :class="logoTextColor"
          >CraftCV</span>
        </div>

        <div
          class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl text-white"
        >
          <h2
            class="font-display text-2xl lg:text-3xl font-semibold text-white tracking-tight mb-3"
          >
            {{ testimonialTitle }}
          </h2>
          <p class="text-stone-200 text-sm lg:text-base leading-relaxed">
            {{ testimonialBody }}
          </p>
        </div>
      </div>
    </div>

    <div
      class="flex flex-col justify-center w-full md:w-[30%] bg-white px-8 py-10 sm:px-12"
    >
      <div class="flex items-center justify-center gap-3 mb-8 md:hidden">
        <NuxtImg
          src="/craftcv-logo.png"
          alt="CraftCV"
          class="h-8 w-auto"
        />
        <span
          class="font-display text-stone-900 font-semibold text-lg tracking-tight"
        >CraftCV</span>
      </div>

      <div class="w-full max-w-sm mx-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
