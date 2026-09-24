<script setup lang="ts">
import { computed } from 'vue'
import type { ResolvedCvData } from '~/types/cv'

const props = defineProps<{
  data: ResolvedCvData
}>()

// Helper to format "YYYY-MM-DD" to just "YYYY" for standard CV views
const formatYear = (dateStr: string | null) => {
  if (!dateStr) return 'Present'
  // If it's a valid date string with at least YYYY, extract the year
  const match = dateStr.match(/^(\d{4})/)
  return match ? match[1] : dateStr
}

const fullName = computed(() => {
  const first = props.data.personal_details.first_name || ''
  const last = props.data.personal_details.last_name || ''
  return `${first} ${last}`.trim()
})

const contactInfo = computed(() => {
  const p = props.data.personal_details
  const items = []
  if (p.email) items.push(p.email)
  if (p.phone) items.push(p.phone)
  if (p.location) items.push(p.location)
  return items
})

const socialLinks = computed(() => {
  const p = props.data.personal_details
  const items = []
  if (p.linkedin) items.push(p.linkedin)
  if (p.github) items.push(p.github)
  if (p.twitter) items.push(p.twitter)
  if (p.website) items.push(p.website)
  return items
})

// Helper to split text by newlines and handle basic bullets
const formatDescription = (text: string | undefined) => {
  if (!text) return []
  return text.split('\n').filter(line => line.trim().length > 0)
}
</script>

<template>
  <div class="bg-white text-gray-800 p-8 sm:p-12 max-w-4xl mx-auto shadow-sm min-h-[1056px] font-sans">
    <!-- HEADER -->
    <header class="mb-10 text-center sm:text-left">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
        {{ fullName }}
      </h1>
      <h2
        v-if="data.title"
        class="text-xl text-gray-500 mb-4"
      >
        {{ data.title }}
      </h2>

      <div
        v-if="contactInfo.length > 0"
        class="text-sm text-gray-500 flex flex-wrap justify-center sm:justify-start gap-x-4 mb-2"
      >
        <span
          v-for="(item, index) in contactInfo"
          :key="index"
          class="flex items-center"
        >
          {{ item }}
          <span
            v-if="index < contactInfo.length - 1"
            class="ml-4 text-gray-300"
          >•</span>
        </span>
      </div>

      <div
        v-if="socialLinks.length > 0"
        class="text-sm text-gray-500 flex flex-wrap justify-center sm:justify-start gap-x-4"
      >
        <a
          v-for="(link, index) in socialLinks"
          :key="index"
          :href="link.startsWith('http') ? link : `https://${link}`"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-blue-600 transition-colors flex items-center"
        >
          {{ link.replace(/^https?:\/\//, '') }}
          <span
            v-if="index < socialLinks.length - 1"
            class="ml-4 text-gray-300"
          >•</span>
        </a>
      </div>
    </header>

    <div class="space-y-8">
      <!-- SUMMARY -->
      <section
        v-if="data.professional_summary"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Summary
        </h3>
        <p class="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
          {{ data.professional_summary }}
        </p>
      </section>

      <!-- EXPERIENCE -->
      <section
        v-if="data.experiences?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Experience
        </h3>
        <div class="space-y-6">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
          >
            <h4 class="font-bold text-gray-900">
              {{ exp.role }}
            </h4>
            <div class="text-sm mb-2 text-gray-600">
              <span class="text-blue-600 font-medium">{{ exp.company }}</span>
              <span v-if="exp.location">, {{ exp.location }}</span>
              <span class="mx-2 text-gray-300">|</span>
              <span>{{ formatYear(exp.start_date) }} - {{ formatYear(exp.end_date) }}</span>
            </div>
            <ul
              v-if="exp.description"
              class="list-none space-y-1"
            >
              <li
                v-for="(line, idx) in formatDescription(exp.description)"
                :key="idx"
                class="text-sm text-gray-700 flex items-start"
              >
                <span class="mr-2 text-gray-400 mt-0.5">•</span>
                <span class="flex-1">{{ line.replace(/^[\s•\-\*]+/, '') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- EDUCATION -->
      <section
        v-if="data.educations?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Education
        </h3>
        <div class="space-y-5">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
          >
            <h4 class="font-bold text-gray-900">
              <template v-if="edu.degree">
                {{ edu.degree }}<span v-if="edu.field_of_study">, {{ edu.field_of_study }}</span>
              </template>
              <template v-else-if="edu.field_of_study">
                {{ edu.field_of_study }}
              </template>
            </h4>
            <div class="text-sm mb-1 text-gray-600">
              <span class="text-blue-600 font-medium">{{ edu.institution }}</span>
              <span class="mx-2 text-gray-300">|</span>
              <span>{{ formatYear(edu.start_date) }} - {{ formatYear(edu.end_date) }}</span>
            </div>
            <p
              v-if="edu.description"
              class="text-sm text-gray-700 mt-1 whitespace-pre-wrap"
            >
              {{ edu.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- SKILLS -->
      <section
        v-if="data.skills?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Skills
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-medium"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- CERTIFICATIONS -->
      <section
        v-if="data.certifications?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Certifications
        </h3>
        <div class="space-y-4">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
          >
            <h4 class="font-bold text-gray-900">
              {{ cert.name }}
            </h4>
            <div class="text-sm text-gray-600">
              <span class="text-blue-600 font-medium">{{ cert.issuer }}</span>
              <span
                v-if="cert.issue_date"
                class="mx-2 text-gray-300"
              >|</span>
              <span v-if="cert.issue_date">{{ formatYear(cert.issue_date) }}</span>
            </div>
            <a
              v-if="cert.credential_url"
              :href="cert.credential_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-blue-500 hover:underline mt-1 block"
            >
              View Credential
            </a>
          </div>
        </div>
      </section>

      <!-- LANGUAGES -->
      <section
        v-if="data.languages?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Languages
        </h3>
        <ul class="flex flex-wrap gap-x-6 gap-y-2 list-none">
          <li
            v-for="lang in data.languages"
            :key="lang.id"
            class="text-sm text-gray-700 flex items-center"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
            <span>
              <span class="font-medium">{{ lang.name }}</span>
              <span
                v-if="lang.proficiency"
                class="text-gray-500 ml-1"
              >({{ lang.proficiency }})</span>
            </span>
          </li>
        </ul>
      </section>

      <!-- AWARDS -->
      <section
        v-if="data.awards?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Awards
        </h3>
        <div class="space-y-4">
          <div
            v-for="award in data.awards"
            :key="award.id"
          >
            <h4 class="font-bold text-gray-900">
              {{ award.name }}
            </h4>
            <div class="text-sm text-gray-600">
              <span
                v-if="award.issuer"
                class="text-blue-600 font-medium"
              >{{ award.issuer }}</span>
              <span
                v-if="award.issuer && award.date"
                class="mx-2 text-gray-300"
              >|</span>
              <span v-if="award.date">{{ formatYear(award.date) }}</span>
            </div>
            <p
              v-if="award.description"
              class="text-sm text-gray-700 mt-1 whitespace-pre-wrap"
            >
              {{ award.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- ADDITIONAL INFORMATION -->
      <section
        v-if="data.additional_information?.length > 0"
        class="cv-section"
      >
        <h3 class="text-sm font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200 pb-2 mb-4">
          Additional Information
        </h3>
        <div class="space-y-4">
          <div
            v-for="info in data.additional_information"
            :key="info.id"
          >
            <h4 class="font-bold text-gray-900">
              {{ info.title }}
            </h4>
            <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
              {{ info.content }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
