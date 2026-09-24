<script setup lang="ts">
import { computed } from 'vue'
import { Phone, Mail, MapPin, Globe, User, Briefcase, GraduationCap, FileText } from '@lucide/vue'
import type { ResolvedCvData } from '~/types/cv'

const props = defineProps<{
  data: ResolvedCvData
}>()

const formatYear = (dateStr: string | null) => {
  if (!dateStr) return 'Present'
  const match = dateStr.match(/^(\d{4})/)
  return match ? match[1] : dateStr
}

const fullName = computed(() => {
  const first = props.data.personal_details.first_name || ''
  const last = props.data.personal_details.last_name || ''
  return `${first} ${last}`.trim()
})

const formatDescription = (text: string | undefined) => {
  if (!text) return []
  return text.split('\n').filter(line => line.trim().length > 0)
}
</script>

<template>
  <div class="relative bg-white max-w-4xl mx-auto shadow-sm min-h-[1056px] font-sans overflow-hidden">
    <!-- HEADER AREA -->
    <header class="bg-[#363f4f] text-white h-48 flex flex-col justify-center px-8 sm:px-12">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-widest uppercase mb-2">
        {{ fullName }}
      </h1>
      <h2
        v-if="data.title"
        class="text-xl sm:text-2xl tracking-[0.2em] uppercase text-gray-300 font-light"
      >
        {{ data.title }}
      </h2>
    </header>


    <div class="flex flex-col sm:flex-row">
      <!-- SIDEBAR -->
      <aside class="sm:w-[32%] bg-[#e6e7eb] text-gray-800 py-10 px-6 sm:px-8 flex flex-col shrink-0 min-h-[800px]">
        <!-- CONTACT -->
        <section class="mb-10">
          <h3 class="text-lg font-bold tracking-widest uppercase text-gray-800 border-b-2 border-gray-400 pb-2 mb-5">
            Contact
          </h3>
          <ul class="space-y-4 text-sm font-medium text-gray-700">
            <li
              v-if="data.personal_details.phone"
              class="flex items-center gap-3"
            >
              <Phone class="w-4 h-4 text-gray-600 shrink-0" />
              <span class="break-words">{{ data.personal_details.phone }}</span>
            </li>
            <li
              v-if="data.personal_details.email"
              class="flex items-center gap-3"
            >
              <Mail class="w-4 h-4 text-gray-600 shrink-0" />
              <span class="break-all">{{ data.personal_details.email }}</span>
            </li>
            <li
              v-if="data.personal_details.location"
              class="flex items-center gap-3"
            >
              <MapPin class="w-4 h-4 text-gray-600 shrink-0" />
              <span class="break-words">{{ data.personal_details.location }}</span>
            </li>
            <li
              v-if="data.personal_details.website"
              class="flex items-center gap-3"
            >
              <Globe class="w-4 h-4 text-gray-600 shrink-0" />
              <a
                :href="data.personal_details.website.startsWith('http') ? data.personal_details.website : `https://${data.personal_details.website}`"
                class="break-all hover:underline"
              >{{ data.personal_details.website.replace(/^https?:\/\//, '') }}</a>
            </li>
            <li
              v-if="data.personal_details.linkedin"
              class="flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-600 shrink-0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              <a
                :href="data.personal_details.linkedin.startsWith('http') ? data.personal_details.linkedin : `https://${data.personal_details.linkedin}`"
                class="break-all hover:underline"
              >{{ data.personal_details.linkedin.replace(/^https?:\/\//, '') }}</a>
            </li>
          </ul>
        </section>

        <!-- SKILLS -->
        <section
          v-if="data.skills?.length > 0"
          class="mb-10"
        >
          <h3 class="text-lg font-bold tracking-widest uppercase text-gray-800 border-b-2 border-gray-400 pb-2 mb-5">
            Skills
          </h3>
          <ul class="list-none space-y-2 text-sm font-medium text-gray-700">
            <li
              v-for="skill in data.skills"
              :key="skill.id"
              class="flex items-center gap-2"
            >
              <span class="text-gray-500 text-[10px]">●</span>
              {{ skill.name }}
            </li>
          </ul>
        </section>

        <!-- LANGUAGES -->
        <section
          v-if="data.languages?.length > 0"
          class="mb-10"
        >
          <h3 class="text-lg font-bold tracking-widest uppercase text-gray-800 border-b-2 border-gray-400 pb-2 mb-5">
            Languages
          </h3>
          <ul class="list-none space-y-2 text-sm font-medium text-gray-700">
            <li
              v-for="lang in data.languages"
              :key="lang.id"
              class="flex items-center gap-2"
            >
              <span class="text-gray-500 text-[10px]">●</span>
              <span>{{ lang.name }} <span
                v-if="lang.proficiency"
                class="font-normal text-gray-500"
              >({{ lang.proficiency }})</span></span>
            </li>
          </ul>
        </section>

        <!-- AWARDS (Moved to sidebar to balance length) -->
        <section
          v-if="data.awards?.length > 0"
          class="mb-10"
        >
          <h3 class="text-lg font-bold tracking-widest uppercase text-gray-800 border-b-2 border-gray-400 pb-2 mb-5">
            Awards
          </h3>
          <div class="space-y-4">
            <div
              v-for="award in data.awards"
              :key="award.id"
            >
              <h4 class="font-bold text-gray-800 text-sm">
                {{ award.name }}
              </h4>
              <div class="text-xs text-gray-600 mt-0.5">
                <span v-if="award.issuer">{{ award.issuer }}</span>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- MAIN COLUMN (With Timeline) -->
      <main class="sm:w-[68%] pt-10 pb-12 pl-4 pr-10 relative text-gray-800">
        <!-- Timeline vertical line (only visible if there are sections) -->
        <div class="absolute left-[31px] top-[40px] bottom-[40px] w-px bg-gray-400 z-0 hidden sm:block" />

        <div class="space-y-12 relative z-10 pl-2 sm:pl-0">
          <!-- PROFILE -->
          <section
            v-if="data.professional_summary"
            class="relative"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-[30px] h-[30px] rounded-full bg-[#363f4f] flex items-center justify-center shrink-0 hidden sm:flex text-white text-xs">
                <User class="w-4 h-4" />
              </div>
              <h3 class="text-xl font-bold tracking-[0.2em] uppercase text-gray-800">
                Profile
              </h3>
            </div>
            <div class="sm:pl-12 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap text-justify">
              {{ data.professional_summary }}
            </div>
          </section>

          <!-- WORK EXPERIENCE -->
          <section
            v-if="data.experiences?.length > 0"
            class="relative"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-[30px] h-[30px] rounded-full bg-[#363f4f] flex items-center justify-center shrink-0 hidden sm:flex text-white text-xs">
                <Briefcase class="w-4 h-4" />
              </div>
              <h3 class="text-xl font-bold tracking-[0.2em] uppercase text-gray-800">
                Work Experience
              </h3>
            </div>

            <div class="sm:pl-12 space-y-8">
              <div
                v-for="exp in data.experiences"
                :key="exp.id"
                class="relative"
              >
                <!-- Timeline dot -->
                <div class="absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border-2 border-gray-400 bg-white hidden sm:block" />

                <header class="flex justify-between items-start mb-2 gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <h4 class="font-bold text-gray-900 text-base">
                      {{ exp.company }}
                    </h4>
                    <div class="text-sm text-gray-600 italic">
                      {{ exp.role }}
                    </div>
                  </div>
                  <div class="text-sm font-medium text-gray-600 shrink-0 uppercase tracking-wide">
                    {{ formatYear(exp.start_date) }} - {{ formatYear(exp.end_date) }}
                  </div>
                </header>

                <ul
                  v-if="exp.description"
                  class="list-none space-y-1.5 mt-2"
                >
                  <li
                    v-for="(line, idx) in formatDescription(exp.description)"
                    :key="idx"
                    class="text-sm text-gray-700 flex items-start"
                  >
                    <span class="mr-2 text-gray-500 text-[10px] mt-1.5">●</span>
                    <span class="flex-1 text-justify">{{ line.replace(/^[\s•\-\*]+/, '') }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- EDUCATION -->
          <section
            v-if="data.educations?.length > 0"
            class="relative"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-[30px] h-[30px] rounded-full bg-[#363f4f] flex items-center justify-center shrink-0 hidden sm:flex text-white text-xs">
                <GraduationCap class="w-4 h-4" />
              </div>
              <h3 class="text-xl font-bold tracking-[0.2em] uppercase text-gray-800">
                Education
              </h3>
            </div>

            <div class="sm:pl-12 space-y-6">
              <div
                v-for="edu in data.educations"
                :key="edu.id"
                class="relative"
              >
                <!-- Timeline dot -->
                <div class="absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border-2 border-gray-400 bg-white hidden sm:block" />

                <header class="flex justify-between items-start mb-1 gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <h4 class="font-bold text-gray-900 text-base">
                      <template v-if="edu.degree">
                        {{ edu.degree }}<span v-if="edu.field_of_study">, {{ edu.field_of_study }}</span>
                      </template>
                      <template v-else-if="edu.field_of_study">
                        {{ edu.field_of_study }}
                      </template>
                    </h4>
                    <div class="text-sm text-gray-600 italic">
                      {{ edu.institution }}
                    </div>
                  </div>
                  <div class="text-sm font-medium text-gray-600 shrink-0 uppercase tracking-wide">
                    {{ formatYear(edu.start_date) }} - {{ formatYear(edu.end_date) }}
                  </div>
                </header>

                <p
                  v-if="edu.description"
                  class="text-sm text-gray-700 mt-2 whitespace-pre-wrap"
                >
                  {{ edu.description }}
                </p>
              </div>
            </div>
          </section>

          <!-- CERTIFICATIONS & ADDITIONAL -->
          <section
            v-if="data.certifications?.length > 0 || data.additional_information?.length > 0"
            class="relative"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-[30px] h-[30px] rounded-full bg-[#363f4f] flex items-center justify-center shrink-0 hidden sm:flex text-white text-xs">
                <FileText class="w-4 h-4" />
              </div>
              <h3 class="text-xl font-bold tracking-[0.2em] uppercase text-gray-800">
                Additional
              </h3>
            </div>

            <div class="sm:pl-12 space-y-6">
              <!-- Certifications -->
              <div
                v-for="cert in data.certifications"
                :key="cert.id"
                class="relative"
              >
                <div class="absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border-2 border-gray-400 bg-white hidden sm:block" />
                <header class="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <h4 class="font-bold text-gray-900">
                      {{ cert.name }}
                    </h4>
                    <div class="text-sm text-gray-600 italic">
                      {{ cert.issuer }}
                    </div>
                  </div>
                  <div
                    v-if="cert.issue_date"
                    class="text-sm font-medium text-gray-600 shrink-0 uppercase tracking-wide"
                  >
                    {{ formatYear(cert.issue_date) }}
                  </div>
                </header>
              </div>

              <!-- Additional Information -->
              <div
                v-for="info in data.additional_information"
                :key="info.id"
                class="relative"
              >
                <div class="absolute -left-[37px] top-1.5 w-2 h-2 rounded-full border-2 border-gray-400 bg-white hidden sm:block" />
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
      </main>
    </div>
  </div>
</template>
