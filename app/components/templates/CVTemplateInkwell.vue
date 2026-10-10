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
  <div class="w-full min-h-[1123px] bg-[#fffdf8] px-10 py-12 text-gray-900 font-sans shadow-sm flex flex-col text-left break-words">
    <!-- Header: Oversized Name & Accent Bar -->
    <header class="mb-4">
      <h1 class="text-6xl font-bold tracking-tight text-gray-900 leading-none mb-4">
        {{ data.personal_details.first_name }}
        <br>
        {{ data.personal_details.last_name }}
      </h1>
      <div
        class="h-2 w-full"
        :style="{ backgroundColor: accentColor }"
      />
    </header>

    <!-- Subtitle & Contact -->
    <div class="text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 mb-10">
      <span
        v-if="data.title"
        class="font-semibold text-gray-800"
      >{{ data.title }}</span>

      <span v-if="data.title && (data.personal_details.location || data.personal_details.phone || data.personal_details.email)">&middot;</span>
      <span v-if="data.personal_details.location">{{ data.personal_details.location }}</span>

      <span v-if="data.personal_details.location && (data.personal_details.phone || data.personal_details.email)">&middot;</span>
      <span v-if="data.personal_details.phone">{{ data.personal_details.phone }}</span>

      <span v-if="data.personal_details.phone && data.personal_details.email">&middot;</span>
      <span v-if="data.personal_details.email">{{ data.personal_details.email }}</span>

      <template v-if="data.personal_details.website && data.personal_details.website !== 'www.yourwebsite.com'">
        <span>&middot;</span>
        <span>{{ data.personal_details.website }}</span>
      </template>
      <template v-if="data.personal_details.linkedin">
        <span>&middot;</span>
        <span>{{ data.personal_details.linkedin }}</span>
      </template>
      <template v-if="data.personal_details.github">
        <span>&middot;</span>
        <span>{{ data.personal_details.github }}</span>
      </template>
      <template v-if="data.personal_details.twitter">
        <span>&middot;</span>
        <span>{{ data.personal_details.twitter }}</span>
      </template>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-8">
      <!-- Summary -->
      <section
        v-if="data.professional_summary?.trim()"
        class="flex flex-col gap-2"
      >
        <h2
          class="font-bold text-sm tracking-widest uppercase flex gap-3 items-center"
          :style="{ color: accentColor }"
        >
          <span class="opacity-80 font-mono">01</span>
          Summary
        </h2>
        <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {{ data.professional_summary }}
        </div>
      </section>

      <!-- Experience -->
      <section
        v-if="data.experiences?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-sm tracking-widest uppercase flex gap-3 items-center"
          :style="{ color: accentColor }"
        >
          <span class="opacity-80 font-mono">02</span>
          Experience
        </h2>
        <div class="flex flex-col gap-5">
          <div
            v-for="exp in data.experiences"
            :key="exp.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-base font-bold text-gray-900">
              {{ exp.role }}
            </h3>
            <div class="text-sm text-gray-500 font-medium">
              {{ exp.company }} &middot; {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
            </div>
            <template
              v-for="(blk, idx) in parseDescription(exp.description)"
              :key="idx"
            >
              <p
                v-if="blk.type === 'p'"
                class="mt-2 text-sm text-gray-700 space-y-1"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="mt-2 text-sm text-gray-700 space-y-1"
              >
                <li
                  v-for="(bullet, bIdx) in blk.items"
                  :key="bIdx"
                  class="flex gap-2"
                >
                  <span
                    class="text-[10px] mt-1 shrink-0"
                    :style="{ color: accentColor }"
                  >&bull;</span>
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section
        v-if="data.skills?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-sm tracking-widest uppercase flex gap-3 items-center"
          :style="{ color: accentColor }"
        >
          <span class="opacity-80 font-mono">03</span>
          Skills
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in data.skills"
            :key="skill.id"
            class="px-3 py-1 text-xs font-bold rounded-full"
            :style="{ backgroundColor: accentTint(accentColor), color: accentColor }"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- Education -->
      <section
        v-if="data.educations?.length > 0"
        class="flex flex-col gap-4"
      >
        <h2
          class="font-bold text-sm tracking-widest uppercase flex gap-3 items-center"
          :style="{ color: accentColor }"
        >
          <span class="opacity-80 font-mono">04</span>
          Education
        </h2>
        <div class="flex flex-col gap-4">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
            class="flex flex-col gap-1"
          >
            <h3 class="text-sm font-bold text-gray-900">
              {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
            </h3>
            <div class="text-xs text-gray-500 font-medium">
              {{ edu.institution }} &middot; {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
            </div>
            <template
              v-for="(blk, idx) in parseDescription(edu.description)"
              :key="idx"
            >
              <p
                v-if="blk.type === 'p'"
                class="mt-1 text-sm text-gray-700 space-y-1"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="mt-1 text-sm text-gray-700 space-y-1"
              >
                <li
                  v-for="(bullet, bIdx) in blk.items"
                  :key="bIdx"
                  class="flex gap-2"
                >
                  <span
                    class="text-[10px] mt-1 shrink-0"
                    :style="{ color: accentColor }"
                  >&bull;</span>
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Certifications -->
      <section
        v-if="data.certifications?.length > 0"
        class="flex flex-col gap-3"
      >
        <h2
          class="font-bold text-sm tracking-widest uppercase flex gap-3 items-center"
          :style="{ color: accentColor }"
        >
          <span class="opacity-80 font-mono">05</span>
          Certifications
        </h2>
        <div class="flex flex-col gap-2">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="flex flex-col"
          >
            <div class="flex items-baseline justify-between gap-4">
              <span class="text-sm font-bold text-gray-900">{{ cert.name }}</span>
              <span class="text-xs text-gray-500 whitespace-nowrap">{{ cert.issue_date ? formatMonthYear(cert.issue_date) : '' }}</span>
            </div>
            <span class="text-xs text-gray-600">{{ cert.issuer }}</span>
          </div>
        </div>
      </section>

      <!-- Languages & Additional Info mapped to other numbers as needed... -->
    </div>
  </div>
</template>
