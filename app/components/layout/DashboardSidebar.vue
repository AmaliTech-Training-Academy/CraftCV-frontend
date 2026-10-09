<script setup lang="ts">
import { ref, watch } from 'vue'
import { PanelLeftClose, PanelLeftOpen, LayoutGrid, Sparkles, Compass, Briefcase, GraduationCap } from '@lucide/vue'
import { useTemplates } from '~/composables/useTemplates'

const isCollapsed = ref(false)
const { templates, categories, activeCategory } = useTemplates()

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const getCategoryCount = (cat: string) => {
  if (cat === 'All') return templates.value.length
  return templates.value.filter(t => t.category === cat).length
}

const tooltipState = ref({ visible: false, text: '', top: 0, left: 0 })

const onHover = (name: string, event: Event) => {
  if (!isCollapsed.value) return
  const el = event.currentTarget as HTMLElement
  if (!el) return

  const rect = el.getBoundingClientRect()
  tooltipState.value = {
    visible: true,
    text: name,
    top: rect.top + (rect.height / 2) - 14,
    left: rect.right + 12,
  }
}

const onLeave = () => {
  tooltipState.value.visible = false
}

watch(isCollapsed, (collapsed) => {
  if (!collapsed) tooltipState.value.visible = false
})
</script>

<template>
  <!-- Desktop sidebar only — mobile uses a pill strip in the page itself -->
  <aside
    :class="[
      'bg-[#B64A22] rounded-tr-[15px] transition-[width] duration-300 ease-in-out flex-col relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.15)]',
      'hidden md:flex',
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
      <ul class="space-y-2.5 px-2">
        <li
          v-for="cat in categories"
          :key="cat"
          :class="{ 'mb-3 pb-1 border-b border-white/10': cat === 'All' }"
        >
          <button
            class="w-full flex items-center transition-colors duration-150"
            :class="[
              activeCategory === cat
                ? (isCollapsed ? 'justify-center rounded-xl bg-white text-[#B64A22] shadow-sm px-0 py-2.5' : 'justify-between rounded-xl bg-white text-[#B64A22] shadow-sm px-4 py-2.5')
                : (isCollapsed ? 'justify-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white px-0 py-2.5' : 'justify-between rounded-xl text-white/80 hover:bg-white/10 hover:text-white px-4 py-2.5'),
            ]"
            :aria-label="cat"
            @click="activeCategory = cat"
            @mouseenter="onHover(cat, $event)"
            @mouseleave="onLeave"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <LayoutGrid
                v-if="cat === 'All'"
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />
              <Sparkles
                v-else-if="cat === 'Creative'"
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />
              <Compass
                v-else-if="cat === 'Modern'"
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />
              <Briefcase
                v-else-if="cat === 'Classic'"
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />
              <GraduationCap
                v-else-if="cat === 'Beginner'"
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />
              <LayoutGrid
                v-else
                :class="[activeCategory === cat ? 'text-[#B64A22]' : 'text-white/80', isCollapsed ? 'w-5 h-5' : 'w-4 h-4']"
              />

              <span
                v-if="!isCollapsed"
                class="text-sm font-semibold truncate"
                :class="activeCategory === cat ? 'text-[#B64A22]' : 'text-white'"
              >{{ cat }}</span>
            </div>
            <span
              v-if="!isCollapsed"
              class="text-[11px] font-bold rounded-full leading-none px-2 py-1 shrink-0"
              :class="activeCategory === cat ? 'bg-[#B64A22]/10 text-[#B64A22]' : 'bg-white/10 text-white/90'"
            >
              {{ getCategoryCount(cat) }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>

  <!-- Tooltip for collapsed sidebar -->
  <Teleport to="body">
    <div
      v-if="tooltipState.visible && isCollapsed"
      class="fixed z-50 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold tracking-wide rounded shadow-xl pointer-events-none transition-all duration-150 ease-out"
      :class="tooltipState.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'"
      :style="{
        top: tooltipState.top + 'px',
        left: tooltipState.left + 'px',
      }"
    >
      {{ tooltipState.text }}
    </div>
  </Teleport>
</template>
