<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'
import { parseDescription, dateRangeLabel } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()

const { accentColor } = useCVState()
</script>

<template>
  <div
    class="w-full h-[1123px] bg-white font-serif text-left break-words overflow-hidden border-[16px] box-border"
    :style="{ borderColor: accentColor }"
  >
    <div class="px-12 py-8 flex flex-col gap-4.5">
      <!-- Header -->
      <header class="w-full flex flex-col items-center text-center">
        <h1
          class="text-[44px] font-bold  leading-none mb-3"
          :style="{ color: accentColor }"
        >
          {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
        </h1>

        <div class="text-[15px] text-gray-500 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 mb-6">
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

          <template v-if="data.personal_details.websiteUrl && data.personal_details.websiteUrl !== 'www.yourwebsite.com'">
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

        <!-- Thick Navy Line -->
        <div
          class="w-full h-[2px] "
          :style="{ backgroundColor: accentColor }"
        />
      </header>

      <!-- Executive Summary -->
      <section
        v-if="data.professional_summary?.trim()"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Executive Summary
        </h2>
        <div class="text-[13.5px] leading-relaxed text-gray-700 whitespace-pre-line">
          {{ data.professional_summary }}
        </div>
      </section>

      <!-- Key Achievements (Additional Information) -->
      <section
        v-if="data.additional_information?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Key Achievements
        </h2>
        <div class="flex flex-col gap-3">
          <div
            v-for="info in data.additional_information"
            :key="info.id"
            class="flex flex-col"
          >
            <div class="flex gap-2">
              <span
                class="text-[14px] mt-0.5 shrink-0"
                :style="{ color: accentColor }"
              >&bull;</span>
              <span class="text-[13.5px] text-gray-700 font-bold">{{ info.title }}:</span>
              <span class="text-[13.5px] text-gray-700">{{ info.description || info.content }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section
        v-if="data.experiences?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Experience
        </h2>
        <div class="flex flex-col gap-5 mt-1">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
            class="flex flex-col gap-1"
          >
            <h3
              class="text-[15px] font-bold "
              :style="{ color: accentColor }"
            >
              {{ exp.role }}
            </h3>
            <div class="text-[13.5px] text-gray-500 mb-1">
              {{ exp.company }} &middot; {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
            </div>
            <template
              v-for="(blk, idx) in parseDescription(exp.description)"
              :key="idx"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[13.5px] text-gray-700 leading-relaxed mt-1"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="text-[13.5px] text-gray-700 space-y-1.5 mt-1"
              >
                <li
                  v-for="(bullet, bIdx) in blk.items"
                  :key="bIdx"
                  class="flex gap-2"
                >
                  <span
                    class="text-[14px] mt-0.5 shrink-0"
                    :style="{ color: accentColor }"
                  >&bull;</span>
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Awards -->
      <section
        v-if="data.awards?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Awards
        </h2>
        <div class="flex flex-col gap-3 mt-1">
          <div
            v-for="award in data.awards"
            :key="award.id"
            class="flex flex-col gap-1"
          >
            <div class="flex gap-2">
              <span
                class="text-[14px] mt-0.5 shrink-0"
                :style="{ color: accentColor }"
              >&bull;</span>
              <span class="text-[13.5px] font-bold text-gray-900">{{ award.name }}</span>
              <span
                v-if="award.issuer"
                class="text-[13.5px] text-gray-700"
              >&middot; {{ award.issuer }}</span>
              <span
                v-if="award.date"
                class="text-[13.5px] text-gray-500"
              >&middot; {{ award.date }}</span>
            </div>
            <div
              v-if="award.description"
              class="pl-4 text-[13.5px] text-gray-700 mt-1"
            >
              {{ award.description }}
            </div>
          </div>
        </div>
      </section>

      <!-- Certifications -->
      <section
        v-if="data.certifications?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Certifications
        </h2>
        <div class="flex flex-col gap-3 mt-1">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="flex flex-col gap-1"
          >
            <div class="flex gap-2">
              <span
                class="text-[14px] mt-0.5 shrink-0"
                :style="{ color: accentColor }"
              >&bull;</span>
              <span class="text-[13.5px] font-bold text-gray-900">{{ cert.name }}</span>
              <span
                v-if="cert.issuer"
                class="text-[13.5px] text-gray-700"
              >&middot; {{ cert.issuer }}</span>
              <span
                v-if="cert.issue_date"
                class="text-[13.5px] text-gray-500"
              >&middot; {{ cert.issue_date }}</span>
            </div>
            <div
              v-if="cert.description"
              class="pl-4 text-[13.5px] text-gray-700 mt-1"
            >
              {{ cert.description }}
            </div>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section
        v-if="data.skills?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Skills
        </h2>
        <div class="flex flex-wrap gap-2 mt-1">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-2.5 py-1 text-[13.5px] bg-gray-100 text-gray-800 rounded-sm"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- Education -->
      <section
        v-if="data.educations?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-[12px] tracking-[0.15em] uppercase border-b border-gray-200 pb-2"
          :style="{ color: accentColor }"
        >
          Education
        </h2>
        <div class="flex flex-col gap-4 mt-1">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
            class="flex flex-col gap-0.5"
          >
            <h3
              class="text-[14px] font-bold "
              :style="{ color: accentColor }"
            >
              {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
            </h3>
            <div class="text-[13.5px] text-gray-500">
              {{ edu.institution }} &middot; {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
