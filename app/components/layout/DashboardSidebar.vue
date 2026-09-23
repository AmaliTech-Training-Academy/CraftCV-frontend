<script setup lang="ts">
import { ref } from 'vue'
import { PanelLeftClose, PanelLeftOpen } from '@lucide/vue'
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
      'bg-[#9A4C2C] rounded-tr-[15px] transition-all duration-300 ease-in-out flex flex-col relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.15)]',
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
        <PanelLeftOpen v-if="isCollapsed" class="w-4 h-4" aria-hidden="true" />
        <PanelLeftClose v-else class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-3" aria-label="Template categories">
      <ul class="space-y-0.5 px-2">
        <!-- "All" — the only category -->
        <li>
          <button
            class="w-full flex items-center transition-colors duration-150"
            :class="[
              isCollapsed
                ? 'justify-center rounded-lg border border-transparent px-0 py-2.5 hover:bg-white/20'
                : 'justify-between rounded-xl bg-white shadow-sm px-4 py-2.5',
            ]"
            aria-current="true"
            aria-label="All templates"
          >
            <!-- Expanded label -->
            <span
              v-if="!isCollapsed"
              class="text-sm font-semibold text-[#9A4C2C]"
            >
              All
            </span>

            <!-- Count badge (both states) -->
            <span
              class="text-[11px] font-bold rounded-full leading-none"
              :class="[
                isCollapsed
                  ? 'bg-white/20 text-white px-1.5 py-1'
                  : 'bg-[#9A4C2C]/10 text-[#9A4C2C] px-2.5 py-1',
              ]"
            >
              {{ templates.length }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>
