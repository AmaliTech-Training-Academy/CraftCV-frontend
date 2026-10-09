<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedCvData } from '~/types/cv'
import { parseDescription } from '~/utils/cvText'
import { useCVState } from '~/composables/useCVState'
import { accentTint } from '~/utils/templateAccents'

const props = defineProps<{
  data: ResolvedCvData
}>()

const { accentColor } = useCVState()

/**
 * How far the rule under a heading is washed towards white.
 *
 * The accent itself goes on the heading text, but a solid rule under a solid
 * heading reads as one heavy band — and with the accent defaulting to
 * near-black, an untinted rule would darken every divider the template ships
 * with. Tinted, the default stays the pale line it was drawn in.
 */
const RULE_TINT = 0.2

const headingStyle = computed(() => ({
  color: accentColor.value,
  borderBottomColor: accentTint(accentColor.value, RULE_TINT),
}))

/** Skill chips take the same two colours as the section headings. */
const chipStyle = computed(() => ({
  color: accentColor.value,
  borderColor: accentTint(accentColor.value, RULE_TINT),
}))

const fullName = computed(() => {
  const first = props.data.personal_details?.first_name || ''
  const last = props.data.personal_details?.last_name || ''
  return `${first} ${last}`.trim()
})

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'Present'
  const match = dateStr.match(/^(\d{4})-(\d{2})/)
  if (match) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(match[2]!) - 1]} ${match[1]}`
  }
  return dateStr
}

const p = computed(() => props.data.personal_details ?? {})

const contactItems = computed(() => {
  const items: { icon: string, value: string, link?: string }[] = []
  if (p.value.email) items.push({ icon: 'email', value: p.value.email })
  if (p.value.phone) items.push({ icon: 'phone', value: p.value.phone })
  if (p.value.location) items.push({ icon: 'location', value: p.value.location })
  if (p.value.websiteUrl) items.push({ icon: 'web', value: p.value.websiteUrl.replace(/^https?:\/\//, ''), link: p.value.websiteUrl })
  if (p.value.linkedinUrl) items.push({ icon: 'linkedin', value: p.value.linkedinUrl.replace(/^https?:\/\//, ''), link: p.value.linkedinUrl })
  if (p.value.githubUrl) items.push({ icon: 'github', value: p.value.githubUrl.replace(/^https?:\/\//, ''), link: p.value.githubUrl })
  if (p.value.twitterUrl) items.push({ icon: 'twitter', value: p.value.twitterUrl.replace(/^https?:\/\//, ''), link: p.value.twitterUrl })
  return items
})
</script>

<template>
  <div class="bg-white font-sans text-[13px] leading-snug min-h-264 overflow-hidden break-words">
    <!-- ══════════ HEADER ══════════ -->
    <header
      class="px-10 pt-9 pb-6 border-b-2"
      :style="{ borderColor: accentColor }"
    >
      <h1 class="text-[28px] font-extrabold text-gray-900 tracking-tight leading-none mb-1">
        {{ fullName }}
      </h1>
      <p
        v-if="data.title"
        class="text-[13px] text-gray-500 font-medium tracking-wide mb-3"
      >
        {{ data.title }}
      </p>

      <!-- Contact bar -->
      <div
        v-if="contactItems.length"
        class="flex flex-wrap gap-x-5 gap-y-1"
      >
        <span
          v-for="item in contactItems"
          :key="item.value"
          class="flex items-center gap-1.5 text-[11px] text-gray-500"
        >
          <!-- email -->
          <template v-if="item.icon === 'email'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          </template>
          <!-- phone -->
          <template v-else-if="item.icon === 'phone'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.12 6.12l1.27-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </template>
          <!-- location -->
          <template v-else-if="item.icon === 'location'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle
              cx="12"
              cy="10"
              r="3"
            /></svg>
          </template>
          <!-- web -->
          <template v-else-if="item.icon === 'web'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
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
          </template>
          <!-- linkedin -->
          <template v-else-if="item.icon === 'linkedin'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
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
          </template>
          <!-- github -->
          <template v-else-if="item.icon === 'github'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
          </template>
          <!-- twitter -->
          <template v-else-if="item.icon === 'twitter'">
            <svg
              class="w-3 h-3 text-gray-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
          </template>
          <template v-else>
            <div class="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
          </template>
          <span class="break-all">{{ item.value }}</span>
        </span>
      </div>
    </header>

    <!-- ══════════ BODY ══════════ -->
    <div class="px-10 py-7 space-y-6">
      <!-- Summary -->
      <section v-if="data.professional_summary">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-3"
          :style="headingStyle"
        >
          Professional Summary
        </h2>
        <p class="text-[12px] text-gray-700 leading-relaxed">
          {{ data.professional_summary }}
        </p>
      </section>

      <!-- Experience -->
      <section v-if="data.experiences?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-4"
          :style="headingStyle"
        >
          Professional Experience
        </h2>
        <div class="space-y-5">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
          >
            <div class="flex justify-between items-baseline gap-2 flex-wrap">
              <h3 class="font-bold text-[13px] text-gray-900 min-w-0">
                {{ exp.role }}
              </h3>
              <span class="text-[11px] text-gray-400 shrink-0 italic">
                {{ formatDate(exp.start_date) }} – {{ formatDate(exp.end_date) }}
              </span>
            </div>
            <p class="text-[11px] text-gray-500 mt-0.5">
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
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section v-if="data.educations?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-4"
          :style="headingStyle"
        >
          Education
        </h2>
        <div class="space-y-4">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
          >
            <div class="flex justify-between items-baseline gap-2 flex-wrap">
              <h3 class="font-bold text-[13px] text-gray-900 min-w-0">
                {{ edu.degree }}<span v-if="edu.field_of_study">, {{ edu.field_of_study }}</span>
              </h3>
              <span class="text-[11px] text-gray-400 shrink-0 italic">
                {{ formatDate(edu.start_date) }} – {{ formatDate(edu.end_date) }}
              </span>
            </div>
            <p class="text-[11px] text-gray-500 mt-0.5">
              {{ edu.institution }}<span v-if="edu.location"> · {{ edu.location }}</span>
            </p>
            <template
              v-for="(blk, i) in parseDescription(edu.description)"
              :key="i"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[11px] text-gray-600 mt-1 leading-relaxed"
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
                  class="text-[11px] text-gray-600 flex items-start gap-1.5"
                >
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section v-if="data.skills?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-3"
          :style="headingStyle"
        >
          Skills
        </h2>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-2.5 py-0.5 border rounded text-[11px]"
            :style="chipStyle"
          >
            {{ skill.name }}<span
              v-if="skill.level"
              class="text-gray-500"
            > ({{ skill.level }})</span>
          </span>
        </div>
      </section>

      <!-- Certifications -->
      <section v-if="data.certifications?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-4"
          :style="headingStyle"
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
                class="text-[11px] text-gray-400 shrink-0 italic"
              >
                {{ formatDate(cert.issue_date) }}
              </span>
            </div>
            <div
              v-if="cert.credential_id || cert.credential_url"
              class="text-[11px] text-gray-500 mt-0.5"
            >
              <span v-if="cert.credential_id">Credential ID: {{ cert.credential_id }}</span>
              <span v-if="cert.credential_id && cert.credential_url"> | </span>
              <a
                v-if="cert.credential_url"
                :href="cert.credential_url"
                target="_blank"
                class="hover:underline text-gray-900 font-medium break-all"
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
                class="text-[11px] text-gray-600 mt-1 leading-relaxed"
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
                  class="text-[11px] text-gray-600 flex items-start gap-1.5"
                >
                  <span class="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Languages -->
      <section v-if="data.languages?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-3"
          :style="headingStyle"
        >
          Languages
        </h2>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <span
            v-for="lang in data.languages"
            :key="lang.id"
            class="text-[12px] text-gray-700"
          >
            {{ lang.name }}<span
              v-if="lang.proficiency"
              class="text-gray-400 ml-1"
            >({{ lang.proficiency }})</span>
          </span>
        </div>
      </section>

      <!-- Awards -->
      <section v-if="data.awards?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-4"
          :style="headingStyle"
        >
          Awards
        </h2>
        <div class="space-y-3">
          <div
            v-for="award in data.awards"
            :key="award.id"
          >
            <div class="flex justify-between items-baseline gap-2 flex-wrap">
              <p class="font-semibold text-[12px] text-gray-900 min-w-0">
                {{ award.name }}
              </p>
              <span
                v-if="award.date"
                class="text-[11px] text-gray-400 shrink-0 italic"
              >
                {{ formatDate(award.date) }}
              </span>
            </div>
            <p
              v-if="award.issuer"
              class="text-[11px] text-gray-500"
            >
              {{ award.issuer }}
            </p>
          </div>
        </div>
      </section>

      <!-- Additional Information -->
      <section v-if="data.additional_information?.length">
        <h2
          class="text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-1 mb-4"
          :style="headingStyle"
        >
          Additional Information
        </h2>
        <div class="space-y-3">
          <div
            v-for="info in data.additional_information"
            :key="info.id"
          >
            <p class="font-semibold text-[12px] text-gray-900">
              {{ info.title }}
            </p>
            <p class="text-[11px] text-gray-700 mt-0.5 leading-relaxed">
              {{ info.content }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
