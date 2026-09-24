<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const isLoaded = ref(false)

const howItWorksRef = ref<HTMLElement | null>(null)
const isHowItWorksVisible = ref(false)
const featuresRef = ref<HTMLElement | null>(null)
const isFeaturesVisible = ref(false)
const ctaRef = ref<HTMLElement | null>(null)
const isCtaVisible = ref(false)

useIntersectionObserver(howItWorksRef, ([entry]) => {
  if (entry?.isIntersecting) isHowItWorksVisible.value = true
}, { threshold: 0.2 })

useIntersectionObserver(featuresRef, ([entry]) => {
  if (entry?.isIntersecting) isFeaturesVisible.value = true
}, { threshold: 0.1 })

useIntersectionObserver(ctaRef, ([entry]) => {
  if (entry?.isIntersecting) isCtaVisible.value = true
}, { threshold: 0.3 })

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

useHead({
  title: 'CraftCV \u2014 Simple, Beautiful CV Maker',
  meta: [
    {
      name: 'description',
      content:
        'Create clean, professional resumes in minutes. Choose designer templates, customize your experience, and download a pixel-perfect PDF with CraftCV.',
    },
  ],
})
</script>

<template>
  <div
    class="relative min-h-screen bg-stone-50 text-stone-900 selection:bg-brand-500 selection:text-white font-sans overflow-clip"
  >
    <!-- Ambient Background Lighting -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl"
    >
      <div
        class="relative left-[calc(50%-18rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-200 via-brand-400/25 to-stone-100 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        style="
          clip-path: polygon(
            74.1% 44.1%,
            100% 61.6%,
            97.5% 26.9%,
            85.5% 0.1%,
            80.7% 2%,
            72.5% 32.5%,
            60.2% 62.4%,
            52.4% 68.1%,
            47.5% 58.3%,
            45.2% 34.5%,
            27.5% 76.7%,
            0.1% 64.9%,
            17.9% 100%,
            27.6% 76.8%,
            76.1% 97.7%,
            74.1% 44.1%
          );
        "
      />
    </div>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute right-0 top-96 -z-10 transform-gpu overflow-hidden blur-3xl opacity-25"
    >
      <div
        class="h-96 w-96 rounded-full bg-gradient-to-br from-brand-300 to-amber-100"
      />
    </div>

    <!-- Sticky Navigation Header -->
    <HomeHeader />

    <!-- Main Content Area -->
    <main>
      <!-- Hero Section -->
      <section
        class="relative pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pb-32 overflow-hidden"
      >
        <video
          aria-hidden="true"
          autoplay
          loop
          muted
          playsinline
          class="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/home.mp4"
            type="video/mp4"
          >
        </video>
        <!-- Overlay to ensure text readability -->
        <div class="absolute inset-0 bg-stone-50/80 backdrop-blur-[2px]" />

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <!-- Hero Headline -->
          <h1
            class="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.12] max-w-5xl mx-auto mb-6 transition-all duration-1000 ease-out transform"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            Create a standout CV that gets you
            <span class="relative inline-block whitespace-nowrap">
              <span
                class="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 bg-clip-text text-transparent"
              >noticed.</span>
              <svg
                aria-hidden="true"
                class="absolute -bottom-2 left-0 w-full text-brand-300 -z-10"
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 15C80 4 220 5 297 12"
                  stroke="currentColor"
                  stroke-width="6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </h1>

          <!-- Hero Subtitle -->
          <p
            class="max-w-2xl mx-auto text-lg sm:text-xl text-stone-600 leading-relaxed font-normal mb-10 transition-all duration-1000 delay-150 ease-out transform"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            CraftCV gives you clean, modern templates and an intuitive editor.
            Fill in your details, see changes in real time, and download a
            pixel-perfect PDF in under 10 minutes.
          </p>

          <!-- Primary CTA Buttons -->
          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12 transition-all duration-1000 delay-300 ease-out transform"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
          >
            <NuxtLink
              to="/register"
              class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-xl shadow-brand-600/30 hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all duration-200 group whitespace-nowrap"
            >
              Build Your Resume Free
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </NuxtLink>
          </div>

          <!-- Micro Proof Features -->
          <div
            class="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-stone-500 font-medium"
          >
            <span class="inline-flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                class="w-4 h-4 text-success"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              100% Free to start
            </span>
            <span class="inline-flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                class="w-4 h-4 text-success"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              No credit card required
            </span>
            <span class="inline-flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                class="w-4 h-4 text-success"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Instant PDF Download
            </span>
            <span class="inline-flex items-center gap-1.5">
              <svg
                aria-hidden="true"
                class="w-4 h-4 text-success"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              Ready in under 10 minutes
            </span>
          </div>
        </div>
      </section>

      <!-- How It Works Section (3 Simple Steps) -->
      <section
        id="how-it-works"
        ref="howItWorksRef"
        class="py-16 sm:py-24 bg-stone-100/70 border-y border-stone-200"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="text-center max-w-2xl mx-auto mb-16 transition-all duration-1000 ease-out transform"
            :class="isHowItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
          >
            <span
              class="text-brand-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
            >Easy 3-Step Process</span>
            <h2
              class="font-display text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight mb-3"
            >
              How CraftCV works
            </h2>
            <p class="text-stone-600 text-base">
              No complex software or confusing options. Just pick, fill, and
              download.
            </p>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-3 gap-8 relative transition-all duration-1000 delay-300 ease-out transform"
            :class="isHowItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
          >
            <!-- Step 1 -->
            <div
              class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm relative"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 font-display font-bold text-lg flex items-center justify-center mb-6 border border-brand-200"
              >
                1
              </div>
              <h3 class="font-display font-bold text-lg text-stone-900 mb-2">
                Choose a Template
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Pick from clean, professionally designed layouts tailored for
                software, design, business, and leadership roles.
              </p>
            </div>

            <!-- Step 2 -->
            <div
              class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm relative"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 font-display font-bold text-lg flex items-center justify-center mb-6 border border-brand-200"
              >
                2
              </div>
              <h3 class="font-display font-bold text-lg text-stone-900 mb-2">
                Enter Your Experience
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Add your work history, education, skills, and contact details
                with our simple, distraction-free form inputs.
              </p>
            </div>

            <!-- Step 3 -->
            <div
              class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm relative"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-600 text-white font-display font-bold text-lg flex items-center justify-center mb-6 shadow-md shadow-brand-600/30"
              >
                3
              </div>
              <h3 class="font-display font-bold text-lg text-stone-900 mb-2">
                Download Pixel-Perfect PDF
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Export high-resolution, vector-crisp PDFs ready to attach to job
                applications or print out with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Interactive CV Preview Section -->
      <HomeInteractivePreview />

      <!-- Key Features Grid -->
      <section
        id="features"
        ref="featuresRef"
        class="py-20 sm:py-28 bg-stone-50"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ease-out transform"
            :class="isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
          >
            <span
              class="text-brand-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
            >Designed for Simplicity</span>
            <h2
              class="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-4"
            >
              Everything you need in a CV maker
            </h2>
            <p class="text-stone-600 text-base sm:text-lg">
              CraftCV gives you the essential tools to build, format, and
              organize your professional CV without the bloat.
            </p>
          </div>

          <!-- 6-Feature Grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-200 ease-out transform"
            :class="isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
          >
            <!-- Feature 1 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                Designer Templates
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Choose from professionally formatted templates that look clean,
                polished, and executive on any device.
              </p>
            </div>

            <!-- Feature 2 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                Live Real-Time Preview
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Watch your CV update live as you type. What you see on your
                screen is exactly what exports to PDF.
              </p>
            </div>

            <!-- Feature 3 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                1-Click PDF Export
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Download high-resolution, vector-crisp PDFs ready to email,
                upload, or print for your interviews.
              </p>
            </div>

            <!-- Feature 4 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                Multiple CV Versions
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Keep tailored versions of your CV for different job titles or
                industries neatly organized in your dashboard.
              </p>
            </div>

            <!-- Feature 5 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                Privacy First
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Your career information is private. We never share or sell your
                personal resume contents to external third parties.
              </p>
            </div>

            <!-- Feature 6 -->
            <div
              class="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 group"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 class="font-display text-xl font-bold text-stone-900 mb-2.5">
                Balanced Typography
              </h3>
              <p class="text-stone-600 text-sm leading-relaxed">
                Handcrafted spacing and typography scales that make your
                qualifications easy to skim and read for any hiring manager.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials / Social Proof Section -->
      <HomeTestimonials />

      <!-- FAQ Section -->
      <HomeFaq />

      <!-- Final High-Impact CTA Banner -->
      <section
        ref="ctaRef"
        class="py-16 sm:py-24 bg-gradient-to-br from-brand-900 via-stone-950 to-stone-900 text-white text-center relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-600/30 via-transparent to-transparent pointer-events-none"
        />

        <div
          class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 ease-out transform"
          :class="isCtaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'"
        >
          <h2
            class="font-display text-4xl sm:text-6xl font-extrabold tracking-tight mb-6"
          >
            Build your professional CV today.
          </h2>
          <p
            class="text-stone-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join thousands of job seekers creating clean, standout resumes that
            employers love to read.
          </p>

          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <NuxtLink
              to="/register"
              class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-xl shadow-brand-600/40 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              Get Started for Free
              <svg
                aria-hidden="true"
                class="w-5 h-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-xl text-base font-semibold text-stone-300 hover:text-white border border-stone-700 hover:border-stone-500 transition whitespace-nowrap"
            >
              Sign into existing account
            </NuxtLink>
          </div>

          <p class="text-xs text-stone-400 mt-6">
            Free to use • Instant PDF export • No credit card required
          </p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <HomeFooter />
  </div>
</template>
