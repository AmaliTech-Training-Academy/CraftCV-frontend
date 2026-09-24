<script setup lang="ts">
defineProps<{
  data: any
}>()
</script>

<template>
  <div class="w-full h-full bg-white px-10 py-12 text-gray-900 font-serif shadow-sm flex flex-col text-left">
    <!-- Header -->
    <div class="flex flex-col border-b border-gray-300 pb-6 mb-6">
      <h1 class="text-4xl font-bold uppercase tracking-widest mb-2 text-gray-900">
        {{ data.personal.firstName }} {{ data.personal.lastName }}
      </h1>
      <h2 class="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
        {{ data.personal.title }}
      </h2>

      <!-- Contact Info -->
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 font-sans">
        <div class="flex items-center gap-1">
          {{ data.personal.email }}
        </div>
        <span class="text-gray-300">|</span>
        <div class="flex items-center gap-1">
          {{ data.personal.phone }}
        </div>
        <span class="text-gray-300">|</span>
        <div class="flex items-center gap-1">
          {{ data.personal.location }}
        </div>

        <template v-if="data.personal.website && data.personal.website !== 'www.yourwebsite.com'">
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1">
            {{ data.personal.website }}
          </div>
        </template>
      </div>
    </div>

    <!-- Body content -->
    <div class="flex flex-col gap-6 pt-4">
      <!-- Summary -->
      <section
        v-if="data.summary"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Professional Summary
        </h3>
        <p class="text-[13px] leading-relaxed text-gray-700 font-sans">
          {{ data.summary }}
        </p>
      </section>

      <!-- Experience -->
      <section
        v-if="data.experience && data.experience.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Experience
        </h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="job in data.experience"
            :key="job.id"
            class="flex flex-col gap-1 font-sans"
          >
            <div class="flex justify-between items-baseline">
              <h4 class="text-[14px] font-bold text-gray-900">
                {{ job.title }}
              </h4>
              <span class="text-[11px] text-gray-500 font-semibold">{{ job.startDate }} - {{ job.endDate }}</span>
            </div>
            <div class="flex justify-between items-baseline mb-1">
              <span class="text-[13px] text-[#C54A22] font-semibold">{{ job.company }}</span>
              <span class="text-[11px] text-gray-500">{{ job.location }}</span>
            </div>
            <p class="text-[13px] leading-relaxed text-gray-700">
              {{ job.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section
        v-if="data.education && data.education.length > 0"
        class="flex flex-col gap-2"
      >
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 border-b border-gray-200 pb-1 mb-1">
          Education
        </h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="edu in data.education"
            :key="edu.id"
            class="flex flex-col gap-1 font-sans"
          >
            <div class="flex justify-between items-baseline">
              <h4 class="text-[14px] font-bold text-gray-900">
                {{ edu.degree }}
              </h4>
              <span class="text-[11px] text-gray-500 font-semibold">{{ edu.startDate }} - {{ edu.endDate }}</span>
            </div>
            <div class="flex justify-between items-baseline mb-1">
              <span class="text-[13px] text-[#C54A22] font-semibold">{{ edu.school }}</span>
              <span class="text-[11px] text-gray-500">{{ edu.location }}</span>
            </div>
            <p class="text-[13px] leading-relaxed text-gray-700">
              {{ edu.description }}
            </p>
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
            <span class="text-[11px] text-gray-500">({{ skill.level }})</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
