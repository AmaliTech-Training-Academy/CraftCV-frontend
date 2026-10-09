<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'
import { accentTint } from '~/utils/templateAccents'
import { parseDescription, dateRangeLabel, formatMonthYear } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()

const { accentColor } = useCVState()
</script>

<template>
  <div class="w-full h-full bg-white px-12 py-12 text-gray-900 font-sans shadow-sm flex flex-col text-left break-words">
    <!-- Header -->
    <header class="w-full mb-8">
      <h1 class="text-[40px] font-bold text-gray-900 leading-none mb-2">
        {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
      </h1>

      <div class="text-[13px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
        <span
          v-if="data.title"
          class="font-medium text-gray-600"
        >{{ data.title }}</span>

        <span v-if="data.title && data.personal_details.location">&middot;</span>
        <span v-if="data.personal_details.location">{{ data.personal_details.location }}</span>

        <span v-if="data.personal_details.location && data.personal_details.email">&middot;</span>
        <span v-if="data.personal_details.email">{{ data.personal_details.email }}</span>

        <span v-if="data.personal_details.email && data.personal_details.phone">&middot;</span>
        <span v-if="data.personal_details.phone">{{ data.personal_details.phone }}</span>

        <template v-if="data.personal_details.website && data.personal_details.website !== 'www.yourwebsite.com'">
          <span>&middot;</span>
          <span>{{ data.personal_details.website.replace(/^https?:\/\//, '') }}</span>
        </template>
        <template v-if="data.personal_details.linkedin">
          <span>&middot;</span>
          <span>{{ data.personal_details.linkedin.replace(/^https?:\/\//, '') }}</span>
        </template>
        <template v-if="data.personal_details.github">
          <span>&middot;</span>
          <span>{{ data.personal_details.github.replace(/^https?:\/\//, '') }}</span>
        </template>
      </div>

      <!-- Short thick purple line -->
      <div
        class="w-20 h-1.5  rounded-full"
        :style="{ backgroundColor: accentColor }"
      />
    </header>

    <!-- Main Content (Custom Ordering for Beginners) -->
    <div class="flex-1 flex flex-col gap-6">
      <!-- Summary -->
      <section
        v-if="data.professional_summary?.trim()"
        class="flex flex-col gap-2"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Profile
        </h2>
        <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {{ data.professional_summary }}
        </div>
      </section>

      <!-- 1. Education -->
      <section
        v-if="data.educations?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Education
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[13px] font-bold text-gray-900">
              {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
            </h3>
            <div class="text-[11.5px] text-gray-500 font-medium">
              {{ edu.institution }} &middot; {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
            </div>
            <ul
              v-if="parseDescription(edu.description).length > 0"
              class="mt-1.5 text-[12.5px] text-gray-700 space-y-1"
            >
              <li
                v-for="(bullet, idx) in parseDescription(edu.description)"
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

      <!-- 2. Projects (Additional Info) -->
      <section
        v-if="data.additional_information?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Projects
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="info in data.additional_information"
            :key="info.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[13px] font-bold text-gray-900">
              {{ info.title }}
            </h3>
            <div class="text-[12.5px] leading-relaxed text-gray-700 whitespace-pre-line mt-1">
              {{ info.description }}
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Skills (Chips) -->
      <section
        v-if="data.skills?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Skills
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-3 py-1 text-[11px] font-bold rounded-full"
            :style="{ backgroundColor: accentTint(accentColor), color: accentColor }"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- 4. Experience -->
      <section
        v-if="data.experiences?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Experience
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[13px] font-bold text-gray-900">
              {{ exp.role }}
            </h3>
            <div class="text-[11.5px] text-gray-500 font-medium">
              {{ exp.company }} &middot; {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
            </div>
            <ul
              v-if="parseDescription(exp.description).length > 0"
              class="mt-1.5 text-[12.5px] text-gray-700 space-y-1"
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

      <!-- 5. Awards/Certifications -->
      <section
        v-if="data.certifications?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Certifications
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-[13px] font-bold text-gray-900">
              {{ cert.name }}
            </h3>
            <div class="text-[11.5px] text-gray-500 font-medium">
              {{ cert.issuer }} &middot; {{ cert.issue_date ? formatMonthYear(cert.issue_date) : '' }}
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Languages (Chips) -->
      <section
        v-if="data.languages?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-xs tracking-widest uppercase"
          :style="{ color: accentColor }"
        >
          Languages
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="lang in data.languages"
            :key="lang.id"
            class="px-3 py-1 text-[11px] font-bold rounded-full"
            :style="{ backgroundColor: accentTint(accentColor), color: accentColor }"
          >
            {{ lang.name }}
          </span>
        </div>
      </section>
    </div>
  </div>
</template>
