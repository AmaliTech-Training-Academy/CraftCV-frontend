<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, LogOut } from '@lucide/vue'
import { useAuth } from '~/composables/useAuth'

const { isAuthenticated, logout } = useAuth()
const isMobileNavOpen = ref(false)

function closeMobileNav() {
  isMobileNavOpen.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isMobileNavOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="md:hidden">
    <!-- Hamburger Button -->
    <button
      class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C54A22]"
      :aria-label="isMobileNavOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="isMobileNavOpen"
      @click="isMobileNavOpen = !isMobileNavOpen"
    >
      <X
        v-if="isMobileNavOpen"
        class="w-5 h-5"
      />
      <Menu
        v-else
        class="w-5 h-5"
      />
    </button>

    <!-- Mobile Nav Drawer -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileNavOpen"
        class="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 px-4 py-3"
      >
        <nav class="flex flex-col gap-1">
          <NuxtLink
            to="/dashboard"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            active-class="bg-[#FEF3EE] text-[#C54A22]"
            exact
            @click="closeMobileNav"
          >
            My Resumes
          </NuxtLink>
          <NuxtLink
            to="/templates"
            class="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            active-class="bg-[#FEF3EE] text-[#C54A22]"
            @click="closeMobileNav"
          >
            Templates
          </NuxtLink>

          <div class="h-px bg-gray-100 my-1" />

          <button
            v-if="isAuthenticated"
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
            @click="logout(); closeMobileNav()"
          >
            <LogOut class="w-4 h-4" />
            Sign out
          </button>
        </nav>
      </div>
    </Transition>
  </div>
</template>
