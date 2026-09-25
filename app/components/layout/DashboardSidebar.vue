<script setup lang="ts">
import { ref } from 'vue'
import { PanelLeftClose, PanelLeftOpen, LayoutGrid } from '@lucide/vue'
import { useTemplates } from '~/composables/useTemplates'

const isCollapsed = ref(false)
const { templates } = useTemplates()

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <aside
    :class="[
      'bg-[#B64A22] rounded-tr-[15px] transition-all duration-300 ease-in-out flex flex-col relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.15)]',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Header row -->
    <div class="px-4 h-12 flex items-center justify-between border-b border-white/20 shrink-0">
      <h2
        v-if="!isCollapsed"
        class="text-[11px] font-bold tracking-[0.12em] text-white/90 uppercase"
      >
        Categories
      </h2>
      <button
        class="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"
        :class="{ 'mx-auto': isCollapsed }"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleSidebar"
      >
        <PanelLeftOpen
          v-if="isCollapsed"
          class="w-4 h-4"
          aria-hidden="true"
        />
        <PanelLeftClose
          v-else
          class="w-4 h-4"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Nav -->
    <nav
      class="flex-1 overflow-y-auto py-3"
      aria-label="Template categories"
    >
      <ul class="space-y-0.5 px-2">
        <!-- "All" — the only category -->
        <li>
          <button
            class="w-full flex items-center transition-colors duration-150"
            :class="[
              isCollapsed
                ? 'justify-center rounded-xl bg-white shadow-sm px-0 py-2.5'
                : 'justify-between rounded-xl bg-white shadow-sm px-4 py-2.5',
            ]"
            aria-current="true"
            aria-label="All templates"
          >
            <!-- Icon and Expanded label -->
            <div class="flex items-center gap-2">
              <LayoutGrid
                class="text-[#B64A22]"
                :class="isCollapsed ? 'w-5 h-5' : 'w-4 h-4'"
              />
              <span
                v-if="!isCollapsed"
                class="text-sm font-semibold text-[#B64A22]"
              >
                All
              </span>
            </div>

            <!-- Count badge (both states) -->
            <span
              v-if="!isCollapsed"
              class="text-[11px] font-bold rounded-full leading-none bg-[#B64A22]/10 text-[#B64A22] px-2.5 py-1"
            >
              {{ templates.length }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>
