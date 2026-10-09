<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertCircle, Edit, Loader2, MoreVertical, Plus, Trash2 } from '@lucide/vue'
import { useCVs, type CVSummary } from '~/composables/useCVs'

useHead({ title: 'Dashboard' })

definePageMeta({
  layout: 'dashboard-wide',
  middleware: ['auth'],
})

const { cvs, loading, loaded, error, fetchCVs, deleteCV, selectCV } = useCVs()

onMounted(fetchCVs)

const showMenuFor = ref<string | null>(null)
const pendingDelete = ref<CVSummary | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const isEmpty = computed(() => loaded.value && !error.value && cvs.value.length === 0)

const formatSavedAt = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

const requestDelete = (cv: CVSummary) => {
  showMenuFor.value = null
  deleteError.value = null
  pendingDelete.value = cv
}

const toggleMenu = (cvId: string) => {
  showMenuFor.value = showMenuFor.value === cvId ? null : cvId
}

const confirmDelete = async () => {
  if (!pendingDelete.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await deleteCV(pendingDelete.value.cvId)
    pendingDelete.value = null
  }
  catch {
    deleteError.value = 'Couldn\'t delete this resume. Please try again.'
  }
  finally {
    deleting.value = false
  }
}

const openCV = async (cv: CVSummary) => {
  if (showMenuFor.value) {
    showMenuFor.value = null
    return
  }
  await selectCV(cv)
}

const handleCardClick = (e: MouseEvent, cv: CVSummary) => {
  const target = e.target as HTMLElement
  if (target.closest('.actions-menu-container')) return
  openCV(cv)
}

const handleCardKeydown = (e: KeyboardEvent, cv: CVSummary) => {
  const target = e.target as HTMLElement
  if (target.closest('.actions-menu-container')) return
  if (e.target !== e.currentTarget) return
  openCV(cv)
}
</script>

<template>
  <div class="min-h-full px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
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

    <!-- Couldn't reach the backend -->
    <div
      v-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <AlertCircle class="w-4 h-4 text-red-500 shrink-0" />
        <p class="text-sm font-medium text-red-700 truncate">
          {{ error }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 text-sm font-semibold text-red-700 hover:text-red-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
        @click="fetchCVs"
      >
        Try again
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="loading && cvs.length === 0"
      class="grid gap-4 sm:gap-6"
      style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden animate-pulse"
      >
        <div class="aspect-[3/4] w-full bg-[#F9F8F6]" />
        <div class="px-4 py-3">
          <div class="h-4 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>

    <!-- Resumes Grid -->
    <div
      v-else-if="cvs.length > 0"
      class="grid gap-4 sm:gap-6"
      style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
    >
      <article
        v-for="cv in cvs"
        :key="cv.cvId"
        role="button"
        tabindex="0"
        :aria-label="`Open ${cv.title}`"
        class="group relative flex flex-col cursor-pointer rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#F26438]/40 transition-all duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26438]/40"
        @click="handleCardClick($event, cv)"
        @keydown.enter.prevent="handleCardKeydown($event, cv)"
        @keydown.space.prevent="handleCardKeydown($event, cv)"
        @mouseleave="showMenuFor = null"
      >
        <!-- Thumbnail Image -->
        <div class="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-[#F9F8F6] relative flex flex-col items-center justify-center border-b border-gray-100">
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
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {{ formatSavedAt(cv.lastSavedAt) || 'Not saved yet' }}
          </span>

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
            {{ cv.title }}
          </span>

          <!-- 3-dot Menu Button -->
          <div
            class="actions-menu-container relative"
            @click.stop
            @keydown.stop
          >
            <button
              type="button"
              :aria-label="`Actions for ${cv.title}`"
              aria-haspopup="menu"
              :aria-expanded="showMenuFor === cv.cvId"
              class="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F26438]/40"
              @click.stop="toggleMenu(cv.cvId)"
            >
              <MoreVertical class="w-4 h-4" />
            </button>

            <!-- Menu Dropdown -->
            <div
              v-if="showMenuFor === cv.cvId"
              role="menu"
              class="absolute right-0 bottom-8 mb-2 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20"
              @click.stop
              @keydown.stop
            >
              <button
                type="button"
                role="menuitem"
                class="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                @click.stop="requestDelete(cv)"
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
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center py-16 sm:py-24 text-center"
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
        class="px-5 py-2.5 rounded-xl bg-[#F26438] text-white text-sm font-semibold hover:bg-[#d95a30] transition-colors shadow-sm inline-flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Browse templates
      </NuxtLink>
    </div>

    <!-- Delete Confirmation -->
    <Dialog
      :open="pendingDelete !== null"
      @update:open="(val: boolean) => { if (!val) pendingDelete = null }"
    >
      <DialogContent
        :show-close-button="false"
        class="sm:max-w-95 p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center gap-0 border-0 shadow-2xl"
      >
        <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 class="w-5 h-5 text-red-500" />
        </div>
        <DialogHeader class="gap-0 flex flex-col items-center text-center">
          <DialogTitle class="text-xl font-bold text-gray-900 mb-2">
            Delete resume?
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-500 text-center max-w-65 leading-relaxed mb-6">
            This permanently deletes "{{ pendingDelete?.title }}". The information you entered in
            other resumes is not affected.
          </DialogDescription>
        </DialogHeader>

        <p
          v-if="deleteError"
          role="alert"
          class="text-xs font-semibold text-red-500 mb-3"
        >
          {{ deleteError }}
        </p>

        <div class="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            :disabled="deleting"
            class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm h-auto cursor-pointer"
            @click="pendingDelete = null"
          >
            Cancel
          </Button>
          <Button
            type="button"
            :disabled="deleting"
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-xs h-auto cursor-pointer inline-flex items-center justify-center gap-2"
            @click="confirmDelete"
          >
            <Loader2
              v-if="deleting"
              class="w-4 h-4 animate-spin"
            />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
