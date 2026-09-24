<template>
  <div class="h-20">
    <header
      class="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-stone-50/85 border-b border-stone-200/70 transition-all"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg p-1"
        >
          <div
            class="relative flex items-center justify-center p-1.5 rounded-xl bg-white border border-stone-200 shadow-sm group-hover:border-brand-300 transition-colors"
          >
            <img
              src="/craftcv-logo.png"
              alt="CraftCV Logo"
              class="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            >
          </div>
          <div class="flex flex-col">
            <span
              class="font-display font-bold text-xl tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors"
            >
              Craft<span class="text-brand-600">CV</span>
            </span>
            <span
              class="text-[10px] uppercase font-semibold tracking-wider text-stone-400 -mt-1"
            >CV Maker</span>
          </div>
        </NuxtLink>

        <nav
          aria-label="Main Navigation"
          class="hidden md:flex items-center gap-8 text-[15px] font-medium text-stone-600"
        >
          <a
            href="#how-it-works"
            class="hover:text-stone-900 transition"
          >How it Works</a>
          <a
            href="#features"
            class="hover:text-stone-900 transition"
          >Features</a>
          <a
            href="#faq"
            class="hover:text-stone-900 transition"
          >FAQ</a>
        </nav>

        <div class="hidden sm:flex items-center gap-3">
          <NuxtLink
            to="/login"
            class="px-4 py-2 text-[15px] font-medium text-stone-700 hover:text-stone-900 transition whitespace-nowrap"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-700 hover:to-brand-700 shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 whitespace-nowrap"
          >
            Create My CV
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 ml-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </NuxtLink>
        </div>

        <button
          type="button"
          class="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
          aria-label="Toggle navigation menu"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg
            v-if="!isMobileMenuOpen"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          <svg
            v-else
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="md:hidden border-b border-stone-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2"
      >
        <nav
          class="flex flex-col gap-1 mb-4"
          aria-label="Mobile Navigation"
        >
          <a
            href="#how-it-works"
            class="w-full px-4 py-3 text-[15px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition"
            @click="isMobileMenuOpen = false"
          >How it Works</a>
          <a
            href="#features"
            class="w-full px-4 py-3 text-[15px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition"
            @click="isMobileMenuOpen = false"
          >Features</a>
          <a
            href="#faq"
            class="w-full px-4 py-3 text-[15px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition"
            @click="isMobileMenuOpen = false"
          >FAQ</a>
        </nav>
        <div class="pt-4 border-t border-stone-200 flex flex-col gap-2">
          <NuxtLink
            to="/login"
            class="w-full text-center py-2.5 rounded-lg border border-stone-200 text-stone-800 font-medium hover:bg-stone-50 whitespace-nowrap"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="w-full text-center py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow whitespace-nowrap"
          >
            Get Started Free
          </NuxtLink>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
</script>
