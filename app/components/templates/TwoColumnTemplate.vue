<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedCvData } from '~/types/cv'
import { parseDescription } from '~/utils/cvText'
import { useCVState } from '~/composables/useCVState'

const props = defineProps<{
  data: ResolvedCvData
}>()

/**
 * Drives the sidebar panel and the main-column headings. It defaults to the
 * slate this template was drawn in, so it looks untouched until a colour is
 * chosen — then the whole chrome of the page follows it.
 */
const { accentColor } = useCVState()

const fullName = computed(() => {
  const first = props.data.personal_details?.first_name || ''
  const last = props.data.personal_details?.last_name || ''
  return `${first} ${last}`.trim()
})

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Present'
  // Try to format YYYY-MM to "Mon YYYY", fallback to raw string
  const match = dateStr.match(/^(\d{4})-(\d{2})/)
  if (match) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(match[2]!) - 1]} ${match[1]}`
  }
  return dateStr
}

const p = computed(() => props.data.personal_details ?? {})
</script>

<template>
  <!-- A4 proportions: 794px wide × 1123px tall at 96dpi -->
  <div class="flex bg-white font-sans text-[13px] leading-snug min-h-264 overflow-hidden break-words">
    <!-- ═══════════ LEFT SIDEBAR ═══════════ -->
    <aside
      class="w-[30%] shrink-0 text-white flex flex-col"
      :style="{ backgroundColor: accentColor }"
    >
      <!-- Name block -->
      <div class="px-6 pt-8 pb-6 border-b border-white/10">
        <h1 class="text-[22px] font-extrabold leading-tight tracking-wide uppercase break-words">
          {{ fullName }}
        </h1>
        <p
          v-if="data.title"
          class="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60"
        >
          {{ data.title }}
        </p>
      </div>

      <!-- Contact -->
      <div class="px-6 pt-5 pb-4">
        <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
          Contact
        </h2>
        <ul class="space-y-2 text-[11px] text-white/80">
          <li
            v-if="p.email"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            <span class="break-all">{{ p.email }}</span>
          </li>
          <li
            v-if="p.phone"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.12 6.12l1.27-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <span>{{ p.phone }}</span>
          </li>
          <li
            v-if="p.location"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle
              cx="12"
              cy="10"
              r="3"
            /></svg>
            <span>{{ p.location }}</span>
          </li>
          <li
            v-if="p.websiteUrl"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><circle
              cx="12"
              cy="12"
              r="10"
            /><line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
            /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <span class="break-all">{{ p.websiteUrl?.replace(/^https?:\/\//, '') }}</span>
          </li>
          <li
            v-if="p.linkedinUrl"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect
              width="4"
              height="12"
              x="2"
              y="9"
            /><circle
              cx="4"
              cy="4"
              r="2"
            /></svg>
            <span class="break-all">{{ p.linkedinUrl?.replace(/^https?:\/\//, '') }}</span>
          </li>
          <li
            v-if="p.githubUrl"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
            <span class="break-all">{{ p.githubUrl?.replace(/^https?:\/\//, '') }}</span>
          </li>
          <li
            v-if="p.twitterUrl"
            class="flex items-start gap-2 min-w-0"
          >
            <svg
              class="w-3 h-3 mt-0.5 shrink-0 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
            <span class="break-all">{{ p.twitterUrl?.replace(/^https?:\/\//, '') }}</span>
          </li>
        </ul>
      </div>

      <!-- Skills -->
      <div
        v-if="data.skills?.length"
        class="px-6 pt-2 pb-4"
      >
        <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
          Skills
        </h2>
        <ul class="space-y-1.5 text-[11px] text-white/80">
          <li
            v-for="skill in data.skills"
            :key="skill.id"
            class="flex items-center gap-2"
          >
            <span class="w-1 h-1 rounded-full bg-white/40 shrink-0" />
            <span>{{ skill.name }}<span
              v-if="skill.level"
              class="text-white/60"
            > ({{ skill.level }})</span></span>
          </li>
        </ul>
      </div>

      <!-- Education -->
      <div
        v-if="data.educations?.length"
        class="px-6 pt-2 pb-4"
      >
        <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
          Education
        </h2>
        <div class="space-y-4 text-[11px]">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
          >
            <p class="font-bold text-white/90 leading-tight">
              {{ edu.institution }}<span v-if="edu.location">, {{ edu.location }}</span>
            </p>
            <p class="text-white/65 mt-0.5">
              {{ edu.degree }}<span v-if="edu.field_of_study">, {{ edu.field_of_study }}</span>
            </p>
            <p class="text-white/40 mt-0.5 text-[10px]">
              {{ formatDate(edu.start_date) }} – {{ formatDate(edu.end_date) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Languages -->
      <div
        v-if="data.languages?.length"
        class="px-6 pt-2 pb-4"
      >
        <h2 class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
          Languages
        </h2>
        <ul class="space-y-1.5 text-[11px] text-white/80">
          <li
            v-for="lang in data.languages"
            :key="lang.id"
            class="flex items-center justify-between"
          >
            <span>{{ lang.name }}</span>
            <span
              v-if="lang.proficiency"
              class="text-white/40 text-[10px]"
            >{{ lang.proficiency }}</span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- ═══════════ MAIN COLUMN ═══════════ -->
    <main class="flex-1 px-8 py-8 space-y-6 text-gray-800 overflow-hidden">
      <!-- Professional Summary -->
      <section v-if="data.professional_summary">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.18em] border-b border-gray-200 pb-1.5 mb-3"
          :style="{ color: accentColor }"
        >
          Professional Summary
        </h2>
        <p class="text-[12px] text-gray-700 leading-relaxed">
          {{ data.professional_summary }}
        </p>
      </section>

      <!-- Work Experience -->
      <section v-if="data.experiences?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.18em] border-b border-gray-200 pb-1.5 mb-4"
          :style="{ color: accentColor }"
        >
          Professional Experience
        </h2>
        <div class="space-y-5">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
          >
            <div class="flex justify-between items-baseline gap-2 flex-wrap">
              <h3 class="font-bold text-gray-900 text-[13px] min-w-0">
                {{ exp.role }}
              </h3>
              <span class="text-[11px] text-gray-400 shrink-0">
                {{ formatDate(exp.start_date) }} – {{ formatDate(exp.end_date) }}
              </span>
            </div>
            <p class="text-[11px] text-gray-500 mt-0.5 italic">
              {{ exp.company }}<span v-if="exp.location"> · {{ exp.location }}</span>
            </p>
            <template
              v-for="(blk, i) in parseDescription(exp.description)"
              :key="i"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[11px] text-gray-700 mt-1.5 leading-relaxed"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="mt-1.5 space-y-1"
              >
                <li
                  v-for="it in blk.items"
                  :key="it"
                  class="text-[11px] text-gray-700 flex items-start gap-1.5"
                >
                  <span class="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Certifications -->
      <section v-if="data.certifications?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.18em] border-b border-gray-200 pb-1.5 mb-4"
          :style="{ color: accentColor }"
        >
          Certifications
        </h2>
        <div class="space-y-3">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="space-y-1"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0">
                <p class="font-semibold text-[12px] text-gray-900">
                  {{ cert.name }}
                </p>
                <p class="text-[11px] text-gray-500">
                  {{ cert.issuer }}
                </p>
              </div>
              <span
                v-if="cert.issue_date"
                class="text-[11px] text-gray-400 shrink-0"
              >{{ formatDate(cert.issue_date) }}</span>
            </div>
            <div
              v-if="cert.credential_id || cert.credential_url"
              class="text-[10px] text-gray-500 mt-0.5"
            >
              <span v-if="cert.credential_id">Credential ID: {{ cert.credential_id }}</span>
              <span v-if="cert.credential_id && cert.credential_url"> | </span>
              <a
                v-if="cert.credential_url"
                :href="cert.credential_url"
                target="_blank"
                class="hover:underline font-medium break-all"
                :style="{ color: accentColor }"
              >
                Verify Credential ↗
              </a>
            </div>
            <template
              v-for="(blk, i) in parseDescription(cert.description)"
              :key="i"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[11px] text-gray-700 mt-1 leading-relaxed"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="mt-1 space-y-1"
              >
                <li
                  v-for="it in blk.items"
                  :key="it"
                  class="text-[11px] text-gray-700 flex items-start gap-1.5"
                >
                  <span class="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Awards -->
      <section v-if="data.awards?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.18em] border-b border-gray-200 pb-1.5 mb-4"
          :style="{ color: accentColor }"
        >
          Awards
        </h2>
        <div class="space-y-2">
          <div
            v-for="award in data.awards"
            :key="award.id"
          >
            <p class="font-semibold text-[12px] text-gray-900">
              {{ award.name }}
            </p>
            <p
              v-if="award.issuer"
              class="text-[11px] text-gray-500"
            >
              {{ award.issuer }}
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
