<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UserCircle, LogOut } from '@lucide/vue'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, logout } = useAuth()
const isAccountMenuOpen = ref(false)
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isAccountMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <header class="h-16 bg-white rounded-b-[15px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-20 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100">
    <!-- Logo -->
    <NuxtLink
      to="/dashboard"
      class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg shrink-0"
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
      <span
        class="font-display font-bold text-xl tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors"
      >
        Craft<span class="text-brand-600">CV</span>
      </span>
    </NuxtLink>

    <!-- Desktop Navigation — hidden on mobile -->
    <nav class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] font-semibold text-gray-500">
      <NuxtLink
        to="/dashboard"
        class="hover:text-gray-900 transition-colors"
        active-class="text-[#F26438] border-b-2 border-[#F26438] pb-1 hover:text-[#F26438]"
        exact
      >
        My Resumes
      </NuxtLink>
      <NuxtLink
        to="/templates"
        class="hover:text-gray-900 transition-colors"
        active-class="text-[#F26438] border-b-2 border-[#F26438] pb-1 hover:text-[#F26438]"
      >
        Templates
      </NuxtLink>
    </nav>

    <!-- Right actions -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Desktop: Account menu -->
      <div
        v-if="isAuthenticated"
        class="hidden md:block relative"
      >
        <button
          class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F26438] focus:ring-offset-2"
          title="Account"
          @click="isAccountMenuOpen = !isAccountMenuOpen"
        >
          <UserCircle class="w-5 h-5" />
        </button>

        <div
          v-if="isAccountMenuOpen"
          class="fixed inset-0 z-10 cursor-default"
          @click="isAccountMenuOpen = false"
        />

        <div
          v-if="isAccountMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-1.5 overflow-hidden"
        >
          <button
            class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            @click="logout(); isAccountMenuOpen = false"
          >
            <LogOut class="w-4 h-4 text-gray-400" />
            Sign out
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <LayoutMobileNavMenu />
    </div>
  </header>
</template>
