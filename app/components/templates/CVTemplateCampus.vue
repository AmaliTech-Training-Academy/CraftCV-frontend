<script setup lang="ts">
import { parseDescription, dateRangeLabel, formatMonthYear } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()
</script>

<template>
  <div class="w-full h-full bg-white px-12 py-12 text-gray-900 font-serif shadow-sm flex flex-col text-left break-words">
    
    <!-- Header -->
    <header class="w-full mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">
        {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
      </h1>
      
      <div class="text-sm text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
        <span v-if="data.title" class="font-medium text-gray-600">{{ data.title }}</span>
        
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
      
      <div class="w-full h-0.5 bg-[#7f1d1d]"></div>
    </header>

    <!-- Main Content (Sections) -->
    <div class="flex-1 flex flex-col">
      
      <!-- Summary -->
      <section v-if="data.professional_summary?.trim()" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase">Profile</h2>
        </div>
        <div class="w-[77%]">
          <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {{ data.professional_summary }}
          </div>
        </div>
      </section>

      <!-- Education -->
      <section v-if="data.educations?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase">Education</h2>
        </div>
        <div class="w-[77%] flex flex-col gap-5">
          <div v-for="edu in data.educations" :key="edu.id" class="flex flex-col gap-1">
            <h3 class="text-sm font-bold text-gray-900">
              {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
            </h3>
            <div class="text-xs text-gray-500 font-medium">
              {{ edu.institution }} &middot; {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
            </div>
            <ul v-if="parseDescription(edu.description).length > 0" class="mt-2 text-sm text-gray-700 space-y-1">
              <li v-for="(bullet, idx) in parseDescription(edu.description)" :key="idx" class="flex gap-2">
                <span class="text-[#7f1d1d] text-[10px] mt-1 shrink-0">&bull;</span>
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section v-if="data.experiences?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase">Experience</h2>
        </div>
        <div class="w-[77%] flex flex-col gap-5">
          <div v-for="exp in data.experiences" :key="exp.id" class="flex flex-col gap-1">
            <h3 class="text-sm font-bold text-gray-900">{{ exp.role }}</h3>
            <div class="text-xs text-gray-500 font-medium">
              {{ exp.company }} &middot; {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
            </div>
            <ul v-if="parseDescription(exp.description).length > 0" class="mt-2 text-sm text-gray-700 space-y-1">
              <li v-for="(bullet, idx) in parseDescription(exp.description)" :key="idx" class="flex gap-2">
                <span class="text-[#7f1d1d] text-[10px] mt-1 shrink-0">&bull;</span>
                <span>{{ bullet }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Certifications / Awards -->
      <section v-if="data.certifications?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase">Awards</h2>
        </div>
        <div class="w-[77%] flex flex-col gap-4">
          <div v-for="cert in data.certifications" :key="cert.id" class="flex flex-col gap-1">
            <h3 class="text-sm font-bold text-gray-900">{{ cert.name }}</h3>
            <div class="text-xs text-gray-500 font-medium">
              {{ cert.issuer }} &middot; {{ cert.issue_date ? formatMonthYear(cert.issue_date) : '' }}
            </div>
          </div>
        </div>
      </section>

      <!-- Projects / Additional Info -->
      <section v-if="data.additional_information?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase">Projects</h2>
        </div>
        <div class="w-[77%] flex flex-col gap-4">
          <div v-for="info in data.additional_information" :key="info.id" class="flex flex-col gap-1">
            <h3 class="text-sm font-bold text-gray-900">{{ info.title }}</h3>
            <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line mt-1">
              {{ info.description }}
            </div>
          </div>
        </div>
      </section>

      <!-- Skills (Chips) -->
      <section v-if="data.skills?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase mt-1">Skills</h2>
        </div>
        <div class="w-[77%] flex flex-wrap gap-2">
          <span 
            v-for="skill in data.skills" 
            :key="skill.id"
            class="px-3 py-1 bg-[#fae8e8] text-[#7f1d1d] text-xs font-bold rounded-full"
          >
            {{ skill.name }}
          </span>
        </div>
      </section>

      <!-- Languages (Chips) -->
      <section v-if="data.languages?.length > 0" class="flex border-b border-gray-200 py-6 first:pt-0 border-b-0 pb-0">
        <div class="w-[23%] pr-4 shrink-0">
          <h2 class="text-[#7f1d1d] font-bold text-xs tracking-[0.2em] uppercase mt-1">Languages</h2>
        </div>
        <div class="w-[77%] flex flex-wrap gap-2">
          <span 
            v-for="lang in data.languages" 
            :key="lang.id"
            class="px-3 py-1 bg-[#fae8e8] text-[#7f1d1d] text-xs font-bold rounded-full"
          >
            {{ lang.name }}
          </span>
        </div>
      </section>
      
    </div>
  </div>
</template>
