<script setup lang="ts">
import { UserCircle } from '@lucide/vue'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <header class="h-16 bg-white rounded-b-[15px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-20 flex items-center justify-between px-8 border-b border-gray-100">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-[#F26438] text-white flex items-center justify-center font-bold text-xl leading-none">
        C
      </div>
      <span class="text-xl font-extrabold text-gray-900 tracking-tight">CraftCV</span>
    </div>

    <!-- Navigation -->
    <nav class="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-[13px] font-semibold text-gray-500">
      <NuxtLink
        to="/"
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

    <!-- Account (Conditional) -->
    <div class="flex items-center gap-4">
      <button
        v-if="isAuthenticated"
        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600"
        title="Account"
      >
        <UserCircle class="w-5 h-5" />
      </button>
      <div
        v-else
        class="w-8"
      /> <!-- Placeholder to keep centering consistent -->
    </div>
  </header>
</template>
