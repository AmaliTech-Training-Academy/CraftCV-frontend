<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MoreVertical, Trash2, Edit } from '@lucide/vue'
import { useCVState } from '~/composables/useCVState'

definePageMeta({
  layout: 'dashboard-wide',
  middleware: ['auth'],
})

const { cvTitle, hasActiveCV, resetCV } = useCVState()
const router = useRouter()
const showMenu = ref(false)

const openEditor = () => {
  router.push('/editor/personal')
}

const handleDelete = () => {
  showMenu.value = false
  resetCV()
}

// Close menu when clicking outside (simple hack: just close on mouseleave for now)
</script>

<template>
  <div class="min-h-full px-8 py-8 max-w-7xl mx-auto">
    <header class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          My Resumes
        </h1>
        <p class="text-sm text-gray-500">
          Your saved resumes will appear here.
        </p>
      </div>

      <NuxtLink
        to="/templates"
        class="px-4 py-2 bg-[#F26438] text-white rounded-lg text-sm font-semibold hover:bg-[#d95a30] transition-colors shadow-sm"
      >
        Create New
      </NuxtLink>
    </header>

    <!-- Resumes Grid -->
    <div
      v-if="hasActiveCV"
      class="grid gap-6"
      style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
    >
      <!-- Current Active CV Card -->
      <article
        class="group relative flex flex-col cursor-pointer rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#F26438]/40 transition-all duration-200 ease-out hover:-translate-y-1"
        @click="openEditor"
        @mouseleave="showMenu = false"
      >
        <!-- Thumbnail Image -->
        <div class="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-[#F9F8F6] relative flex flex-col items-center justify-center border-b border-gray-100">
          <!-- Generic document icon -->
          <svg
            class="w-16 h-16 text-gray-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          /></svg>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest">In Progress</span>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span class="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5">
              <Edit class="w-3.5 h-3.5" />
              Continue Editing
            </span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-4 py-3 flex items-center justify-between relative">
          <span class="text-sm font-semibold text-gray-900 truncate pr-2">
            {{ cvTitle }}
          </span>

          <!-- 3-dot Menu Button -->
          <div class="relative">
            <button
              class="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
              @click.stop="showMenu = !showMenu"
            >
              <MoreVertical class="w-4 h-4" />
            </button>

            <!-- Menu Dropdown -->
            <div
              v-if="showMenu"
              class="absolute right-0 bottom-8 mb-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20"
            >
              <!-- Delete Option -->
              <button
                class="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                @click.stop="handleDelete"
              >
                <Trash2 class="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        /></svg>
      </div>
      <p class="text-gray-900 font-semibold mb-1">
        No resumes yet
      </p>
      <p class="text-gray-500 text-sm mb-6 max-w-sm">
        You haven't created any resumes. Pick a template to get started on your next opportunity.
      </p>
      <NuxtLink
        to="/templates"
        class="px-5 py-2.5 rounded-xl bg-[#F26438] text-white text-sm font-semibold hover:bg-[#d95a30] transition-colors shadow-sm"
      >
        Browse templates
      </NuxtLink>
    </div>
  </div>
</template>
