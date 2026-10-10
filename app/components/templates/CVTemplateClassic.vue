<script setup lang="ts">
import { parseDescription, dateRangeLabel, formatMonthYear } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()
</script>

<template>
  <div class="w-full h-full bg-white px-10 py-12 text-gray-900 font-serif shadow-sm flex flex-col text-left break-words">
    <!-- Header -->
    <div class="flex flex-col border-b border-gray-300 pb-6 mb-6">
      <h1 class="text-4xl font-bold uppercase tracking-widest mb-2 text-gray-900">
        {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
      </h1>
      <h2 class="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        {{ data.title }}
      </h2>

      <!-- Contact Info -->
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 font-sans">
        <div class="flex items-center gap-1 min-w-0">
          <span class="truncate">{{ data.personal_details.email }}</span>
        </div>
        <span class="text-gray-300">|</span>
        <div class="flex items-center gap-1 min-w-0">
          <span class="truncate">{{ data.personal_details.phone }}</span>
        </div>
        <span class="text-gray-300">|</span>
        <div class="flex items-center gap-1 min-w-0">
          <span class="truncate">{{ data.personal_details.location }}</span>
        </div>

        <template v-if="data.personal_details.website && data.personal_details.website !== 'www.yourwebsite.com'">
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 min-w-0">
            <span class="truncate">{{ data.personal_details.website }}</span>
          </div>
        </template>
        <template v-if="data.personal_details.linkedin">
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 min-w-0">
            <span class="truncate">{{ data.personal_details.linkedin }}</span>
          </div>
        </template>
        <template v-if="data.personal_details.github">
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 min-w-0">
            <span class="truncate">{{ data.personal_details.github }}</span>
          </div>
        </template>
        <template v-if="data.personal_details.twitter">
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 min-w-0">
            <span class="truncate">{{ data.personal_details.twitter }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Body content -->
    <div class="flex flex-col gap-6 pt-4">
      <!-- Summary -->
      <section
        v-if="data.professional_summary"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Professional Summary
        </h3>
        <p class="text-[13px] leading-relaxed text-gray-700 font-sans">
          {{ data.professional_summary }}
        </p>
      </section>

      <!-- Experience -->
      <section
        v-if="data.experiences && data.experiences.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Experience
        </h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="job in data.experiences"
            :key="job.id"
            class="flex flex-col gap-1 font-sans"
          >
            <div class="flex justify-between items-baseline gap-2">
              <h4 class="text-[14px] font-bold text-gray-900 min-w-0">
                {{ job.role }}
              </h4>
              <span class="text-[11px] text-gray-500 font-semibold shrink-0">{{ dateRangeLabel(job.start_date, job.end_date, !job.end_date) }}</span>
            </div>
            <div class="flex justify-between items-baseline mb-1 gap-2">
              <span class="text-[13px] text-[#C54A22] font-semibold min-w-0">{{ job.company }}</span>
              <span class="text-[11px] text-gray-500 shrink-0">{{ job.location }}</span>
            </div>
            <template
              v-for="(blk, i) in parseDescription(job.description)"
              :key="i"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[13px] leading-relaxed text-gray-700"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="text-[13px] leading-relaxed text-gray-700 list-disc list-inside space-y-0.5"
              >
                <li
                  v-for="it in blk.items"
                  :key="it"
                >
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section
        v-if="data.educations && data.educations.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Education
        </h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="edu in data.educations"
            :key="edu.id"
            class="flex flex-col gap-1 font-sans"
          >
            <div class="flex justify-between items-baseline gap-2">
              <h4 class="text-[14px] font-bold text-gray-900 min-w-0">
                {{ edu.degree }}
              </h4>
              <span class="text-[11px] text-gray-500 font-semibold shrink-0">{{ dateRangeLabel(edu.start_date, edu.end_date, !edu.end_date) }}</span>
            </div>
            <div class="flex justify-between items-baseline mb-1 gap-2">
              <span class="text-[13px] text-[#C54A22] font-semibold min-w-0">{{ edu.institution }}</span>
              <span class="text-[11px] text-gray-500 shrink-0">{{ edu.location }}</span>
            </div>
            <template
              v-for="(blk, i) in parseDescription(edu.description)"
              :key="i"
            >
              <p
                v-if="blk.type === 'p'"
                class="text-[13px] leading-relaxed text-gray-700"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="text-[13px] leading-relaxed text-gray-700 list-disc list-inside space-y-0.5"
              >
                <li
                  v-for="it in blk.items"
                  :key="it"
                >
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section
        v-if="data.skills && data.skills.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Skills
        </h3>
        <div class="flex flex-wrap gap-x-6 gap-y-2 font-sans">
          <div
            v-for="skill in data.skills"
            :key="skill.id"
            class="flex items-center gap-2"
          >
            <span class="w-1.5 h-1.5 bg-[#C54A22] rounded-full" />
            <span class="text-[13px] font-semibold text-gray-800">{{ skill.name }}</span>
            <span
              v-if="skill.level"
              class="text-[11px] text-gray-500"
            >({{ skill.level }})</span>
          </div>
        </div>
      </section>

      <!-- Certifications -->
      <section
        v-if="data.certifications && data.certifications.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Certifications
        </h3>
        <div class="flex flex-col gap-3 font-sans">
          <div
            v-for="cert in data.certifications"
            :key="cert.id"
            class="flex flex-col gap-0.5"
          >
            <div class="flex justify-between items-baseline gap-2">
              <h4 class="text-[14px] font-bold text-gray-900 min-w-0">
                {{ cert.name }}
              </h4>
              <span
                v-if="cert.issue_date"
                class="text-[11px] text-gray-500 font-semibold shrink-0"
              >{{ formatMonthYear(cert.issue_date) }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-2">
              <span class="text-[13px] text-[#C54A22] font-semibold min-w-0">{{ cert.issuer }}</span>
            </div>
            <div
              v-if="cert.credential_id || cert.credential_url"
              class="text-[12px] text-gray-500 mt-0.5"
            >
              <span v-if="cert.credential_id">Credential ID: {{ cert.credential_id }}</span>
              <span v-if="cert.credential_id && cert.credential_url"> | </span>
              <a
                v-if="cert.credential_url"
                :href="cert.credential_url"
                target="_blank"
                class="hover:underline text-[#C54A22] break-all"
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
                class="text-[13px] leading-relaxed text-gray-700 mt-0.5"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="text-[13px] leading-relaxed text-gray-700 list-disc list-inside space-y-0.5 mt-0.5"
              >
                <li
                  v-for="it in blk.items"
                  :key="it"
                >
                  {{ it }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
