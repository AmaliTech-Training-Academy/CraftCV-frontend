<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'
import { parseDescription, dateRangeLabel } from '~/utils/cvText'

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}>()

const { accentColor } = useCVState()

const getMeterWidth = (level?: string) => {
  if (!level) return '100%'
  const l = level.toLowerCase()
  if (l === 'beginner' || l === 'basic') return '33%'
  if (l === 'intermediate') return '66%'
  if (l === 'advanced' || l === 'fluent' || l === 'native') return '100%'
  return '80%' // Default fallback
}
</script>

<template>
  <div class="w-full min-h-[1123px] bg-white text-gray-900 font-sans shadow-sm flex flex-col text-left break-words">
    <!-- Header: Full-width Gradient -->
    <header
      class="w-full px-10 py-10 text-white flex flex-col justify-center"
      :style="{ background: `linear-gradient(to right, ${accentColor}, color-mix(in srgb, ${accentColor} 60%, white))` }"
    >
      <h1 class="text-5xl font-bold tracking-tight mb-2">
        {{ data.personal_details.first_name }} {{ data.personal_details.last_name }}
      </h1>
      <h2
        v-if="data.title"
        class="text-lg font-medium opacity-90 tracking-wide"
      >
        {{ data.title }}
      </h2>
    </header>

    <!-- Content: Flex-row-reverse to put Main (Right) before Sidebar (Left) in DOM -->
    <div class="flex-1 flex flex-row-reverse w-full min-h-0">
      <!-- Right Main Column (69%) -->
      <main class="w-[69%] px-10 py-8 flex flex-col gap-8 overflow-hidden">
        <!-- Profile -->
        <section v-if="data.professional_summary?.trim()">
          <h3
            class="font-bold text-sm tracking-widest uppercase mb-3"
            :style="{ color: accentColor }"
          >
            Profile
          </h3>
          <div class="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {{ data.professional_summary }}
          </div>
        </section>

        <!-- Experience Timeline -->
        <section v-if="data.experiences?.length > 0">
          <h3
            class="font-bold text-sm tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Experience
          </h3>
          <div class="flex flex-col gap-6">
            <div
              v-for="exp in data.experiences"
              :key="exp.id"
              class="relative pl-5"
            >
              <!-- Timeline Track -->
              <div
                class="absolute left-0 top-1 bottom-[-24px] w-[2px] "
                :style="{ backgroundColor: accentColor }"
              />

              <!-- Job Header -->
              <h4 class="text-base font-bold text-gray-900">
                {{ exp.role }}
              </h4>
              <div class="text-sm text-gray-500 font-medium mb-2">
                {{ exp.company }}
                <span v-if="exp.company && (exp.start_date || exp.end_date)">&nbsp;|&nbsp;</span>
                {{ dateRangeLabel(exp.start_date, exp.end_date, exp.is_current) }}
              </div>

              <!-- Bullets -->
              <template
                v-for="(blk, idx) in parseDescription(exp.description)"
                :key="idx"
              >
                <p
                  v-if="blk.type === 'p'"
                  class="text-sm text-gray-700 space-y-1"
                >
                  {{ blk.text }}
                </p>
                <ul
                  v-else
                  class="text-sm text-gray-700 space-y-1"
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

        <!-- Additional Information (Mapped as Selected Work/Projects) -->
        <section v-if="data.additional_information?.length > 0">
          <h3
            class="font-bold text-sm tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Selected Work
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="info in data.additional_information"
              :key="info.id"
              :style="{ backgroundColor: `color-mix(in srgb, ${accentColor} 15%, white)`, color: accentColor }"
              class="px-4 py-1.5 text-xs font-bold rounded-full"
            >
              {{ info.title }}
            </span>
          </div>
        </section>
      </main>

      <!-- Left Sidebar (31%) -->
      <aside class="w-[31%]  px-8 py-8 flex flex-col gap-8 shrink-0">
        <!-- Contact -->
        <section class="flex flex-col gap-2 text-sm text-gray-700 font-medium">
          <h3
            class="font-bold text-[11px] tracking-widest uppercase mb-1"
            :style="{ color: accentColor }"
          >
            Contact
          </h3>
          <div
            v-if="data.personal_details.email"
            class="break-all"
          >
            {{ data.personal_details.email }}
          </div>
          <div v-if="data.personal_details.phone">
            {{ data.personal_details.phone }}
          </div>
          <div v-if="data.personal_details.location">
            {{ data.personal_details.location }}
          </div>
          <div
            v-if="data.personal_details.websiteUrl && data.personal_details.websiteUrl !== 'www.yourwebsite.com'"
            class="break-all"
          >
            {{ data.personal_details.websiteUrl.replace(/^https?:\/\//, '') }}
          </div>
          <div
            v-if="data.personal_details.linkedinUrl"
            class="break-all"
          >
            {{ data.personal_details.linkedinUrl.replace(/^https?:\/\//, '') }}
          </div>
          <div
            v-if="data.personal_details.githubUrl"
            class="break-all"
          >
            {{ data.personal_details.githubUrl.replace(/^https?:\/\//, '') }}
          </div>
        </section>

        <!-- Skills (Meters) -->
        <section v-if="data.skills?.length > 0">
          <h3
            class="font-bold text-[11px] tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Skills
          </h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="skill in data.skills"
              :key="skill.id"
              class="flex flex-col gap-1"
            >
              <span class="text-xs font-bold text-gray-900">{{ skill.name }}</span>
              <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full  rounded-full"
                  :style="{ backgroundColor: accentColor, width: getMeterWidth(skill.level) }"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Education -->
        <section v-if="data.educations?.length > 0">
          <h3
            class="font-bold text-[11px] tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Education
          </h3>
          <div class="flex flex-col gap-4">
            <div
              v-for="edu in data.educations"
              :key="edu.id"
              class="flex flex-col"
            >
              <h4 class="text-xs font-bold text-gray-900 leading-tight mb-1">
                {{ edu.degree }}{{ edu.field_of_study ? ` in ${edu.field_of_study}` : '' }}
              </h4>
              <span class="text-xs text-gray-500 mb-0.5">{{ edu.institution }}</span>
              <span class="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                {{ dateRangeLabel(edu.start_date, edu.end_date, edu.is_current) }}
              </span>
            </div>
          </div>
        </section>

        <!-- Languages (Meters) -->
        <section v-if="data.languages?.length > 0">
          <h3
            class="font-bold text-[11px] tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Languages
          </h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="lang in data.languages"
              :key="lang.id"
              class="flex flex-col gap-1"
            >
              <span class="text-xs font-bold text-gray-900">{{ lang.name }}</span>
              <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full  rounded-full"
                  :style="{ backgroundColor: accentColor, width: getMeterWidth(lang.proficiency) }"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Certifications (Mapped as Awards/Certificates) -->
        <section v-if="data.certifications?.length > 0">
          <h3
            class="font-bold text-[11px] tracking-widest uppercase mb-4"
            :style="{ color: accentColor }"
          >
            Awards & Certs
          </h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="cert in data.certifications"
              :key="cert.id"
              class="flex flex-col"
            >
              <h4 class="text-xs font-bold text-gray-900 leading-tight">
                {{ cert.name }}
              </h4>
              <span class="text-[10px] text-gray-500">{{ cert.issuer }}</span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
