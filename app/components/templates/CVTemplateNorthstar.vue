<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'
import { accentTint } from '~/utils/templateAccents'
import { parseDescription, dateRangeLabel, formatMonthYear } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()

const { accentColor } = useCVState()

const getMeterWidthStr = (level?: string) => {
  if (!level) return '100%'
  const l = level.toLowerCase()
  if (l === 'beginner' || l === 'basic') return '33%'
  if (l === 'intermediate') return '66%'
  if (l === 'advanced' || l === 'fluent' || l === 'native') return '100%'
  return '80%'
}
</script>

<template>
  <div class="w-full h-full flex flex-row font-sans text-left break-words bg-white overflow-hidden">
    <!-- LEFT COLUMN (Main, ~69%) -->
    <div class="w-[69%] h-full px-10 py-12 flex flex-col gap-7">
      <!-- Header -->
      <header class="w-full">
        <h1 class="text-[44px] font-bold text-gray-900 leading-none mb-3 tracking-tight">
          {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
        </h1>

        <div class="text-[15px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            v-if="data.title"
            class="text-gray-500"
          >{{ data.title }}</span>

          <span v-if="data.title && data.personal_details.location">&middot;</span>
          <span v-if="data.personal_details.location">{{ data.personal_details.location }}</span>

          <span v-if="data.personal_details.location && data.personal_details.email">&middot;</span>
          <span v-if="data.personal_details.email">{{ data.personal_details.email }}</span>

          <span v-if="data.personal_details.email && data.personal_details.phone">&middot;</span>
          <span v-if="data.personal_details.phone">{{ data.personal_details.phone }}</span>

<<<<<<< HEAD
          <template v-if="data.personal_details.websiteUrl && data.personal_details.websiteUrl !== 'www.yourwebsite.com'">
=======
          <template v-if="data.personal_details.website && data.personal_details.website !== 'www.yourwebsite.com'">
>>>>>>> a38a834 (feat: add accent color to templates)
            <span>&middot;</span>
            <span>{{ data.personal_details.websiteUrl.replace(/^https?:\/\//, '') }}</span>
          </template>
          <template v-if="data.personal_details.linkedinUrl">
            <span>&middot;</span>
            <span>{{ data.personal_details.linkedinUrl.replace(/^https?:\/\//, '') }}</span>
          </template>
          <template v-if="data.personal_details.githubUrl">
            <span>&middot;</span>
            <span>{{ data.personal_details.githubUrl.replace(/^https?:\/\//, '') }}</span>
          </template>
        </div>
      </header>

      <!-- Profile -->
      <section
        v-if="data.professional_summary?.trim()"
        class="flex flex-col gap-2"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Profile
        </h2>
        <div class="text-[13px] leading-relaxed text-gray-700 whitespace-pre-line">
          {{ data.professional_summary }}
        </div>
      </section>

      <!-- Experience -->
      <section
        v-if="data.experiences?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Experience
        </h2>
        <div class="flex flex-col gap-5">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[14px] font-bold text-gray-900">
              {{ exp.role }}
            </h3>
            <div class="text-[12px] text-gray-500">
              {{ exp.company }} &middot; {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
            </div>
            <ul
              v-if="parseDescription(exp.description).length > 0"
              class="mt-2 text-[13px] text-gray-700 space-y-1.5"
            >
              <li
                v-for="(bullet, idx) in parseDescription(exp.description)"
                :key="idx"
                class="flex gap-2"
              >
                <span
                  class="text-[12px] mt-0.5 shrink-0"
                  :style="{ color: accentColor }"
                >&bull;</span>
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Projects -->
      <section
        v-if="data.additional_information?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Selected Projects
        </h2>
        <div class="flex flex-col gap-5">
          <div
            v-for="info in data.additional_information"
            :key="info.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[14px] font-bold text-gray-900">
              {{ info.title }}
            </h3>
            <div class="text-[13px] leading-relaxed text-gray-700 whitespace-pre-line mt-1">
              {{ info.description }}
            </div>
          </div>
        </div>
      </section>

      <!-- Awards -->
      <section
        v-if="data.certifications?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Awards
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[14px] font-bold text-gray-900">
              {{ cert.name }}
            </h3>
            <div class="text-[12px] text-gray-500">
              {{ cert.issuer }} &middot; {{ cert.issue_date ? formatMonthYear(cert.issue_date) : '' }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- RIGHT COLUMN (Sidebar, ~31%) -->
    <div
      class="w-[31%] h-full px-7 py-12 flex flex-col gap-7"
      :style="{ backgroundColor: accentTint(accentColor, 0.07) }"
    >
      <!-- Skills -->
      <section
        v-if="data.skills?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase mt-4"
          :style="{ color: accentColor }"
        >
          Skills
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-2.5 py-1 text-[11px] font-bold rounded-full"
            :style="{ backgroundColor: accentTint(accentColor, 0.16), color: accentColor }"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- Certifications (Alternative placement if no awards in left) -->
      <!-- Let's put Education here -->
      <section
        v-if="data.educations?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Education
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
            class="flex flex-col gap-0.5"
          >
            <h3 class="text-[13px] font-bold text-gray-900 leading-tight">
              {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
            </h3>
            <div class="text-[11.5px] text-gray-600 font-medium">
              {{ edu.institution }}
            </div>
            <div class="text-[11.5px] text-gray-500">
              {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Languages -->
      <section
        v-if="data.languages?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-[11px] tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Languages
        </h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="lang in data.languages"
            :key="lang.id"
            class="flex flex-col gap-1.5"
          >
            <div class="text-[13px] font-bold text-gray-900 leading-none">
              {{ lang.name }}
            </div>
            <!-- Progress Bar -->
            <div class="w-full h-1.5 bg-[#cbd5e1] rounded-full overflow-hidden">
              <div
                class="h-full  rounded-full"
                :style="{ backgroundColor: accentColor, width: getMeterWidthStr(lang.level) }"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
