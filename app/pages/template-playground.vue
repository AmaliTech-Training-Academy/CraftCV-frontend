<script setup lang="ts">
import { ref } from 'vue'
import { definePageMeta } from '#imports'
import type { ResolvedCvData } from '~/types/cv'
import SingleColumnTemplate from '~/components/templates/SingleColumnTemplate.vue'
import TwoColumnTemplate from '~/components/templates/TwoColumnTemplate.vue'

definePageMeta({
  layout: 'dashboard-wide',
  auth: false,
})

const activeTab = ref<'atlantic' | 'meridian'>('atlantic')
const scale = ref(0.65)

const mockData1: ResolvedCvData = {
  title: 'Senior Product Lead',
  professional_summary: 'Experienced product leader specializing in cross-functional team management and scaling SaaS platforms. Proven track record of increasing user retention by 40% and driving $5M+ in new revenue through strategic feature launches.',
  personal_details: {
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah@domain.co',
    phone: '+44 7911 123456',
    location: 'London, UK',
    website: 'sarahjenkins.dev',
    linkedin: 'linkedin.com/in/sarahjenkins',
  },
  experiences: [
    {
      id: 1,
      job_title: 'Senior Product Manager',
      company_name: 'TechFlow Solutions',
      location: 'London, UK',
      start_date: '2020-03-01',
      end_date: null,
      description: 'Led a team of 12 engineers and designers to launch the flagship analytics dashboard.\nIncreased enterprise adoption by 60% within the first two quarters.',
    },
    {
      id: 2,
      job_title: 'Product Manager',
      company_name: 'InnovateX',
      location: 'Manchester, UK',
      start_date: '2017-06-01',
      end_date: '2020-02-01',
      description: 'Managed the core onboarding flow, reducing drop-off rates by 25%.\nConducted 100+ user interviews to define the roadmap for 2019.',
    },
  ],
  educations: [
    {
      id: 1,
      degree: 'MSc Computer Science',
      institution_name: 'University of Edinburgh',
      location: 'Edinburgh, UK',
      start_date: '2015-09-01',
      end_date: '2016-07-01',
      description: 'Graduated with Distinction. Thesis on predictive analytics in SaaS.',
    },
    {
      id: 2,
      degree: 'BSc Software Engineering',
      institution_name: 'University of Manchester',
      location: 'Manchester, UK',
      start_date: '2011-09-01',
      end_date: '2015-06-01',
      description: 'First Class Honours.',
    },
  ],
  skills: [
    { id: 1, name: 'Product Strategy' },
    { id: 2, name: 'Agile & Scrum' },
    { id: 3, name: 'Data Analysis' },
    { id: 4, name: 'User Research' },
    { id: 5, name: 'Team Leadership' },
  ],
  certificates: [
    {
      id: 1,
      name: 'Certified Scrum Product Owner (CSPO)',
      issuer: 'Scrum Alliance',
      issue_date: '2018-05-01',
      credential_url: '',
    },
  ],
  languages: [
    {
      id: 1,
      name: 'English',
      proficiency: 'Native',
    },
    {
      id: 2,
      name: 'Spanish',
      proficiency: 'Professional Working',
    },
  ],
}

const mockData2: ResolvedCvData = {
  title: 'Full-Stack Systems Architect',
  professional_summary: 'Architecting scalable microservices for enterprise fintech solutions. Over 8 years of experience designing high-availability backends and robust frontend applications using modern frameworks.',
  personal_details: {
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena@domain.co',
    phone: '+1 555 0192',
    location: 'Dublin, Ireland',
    website: '',
    linkedin: '',
  },
  experiences: [
    {
      id: 3,
      job_title: 'Systems Architect',
      company_name: 'Global Finance Corp',
      location: 'Dublin, Ireland',
      start_date: '2019-01-01',
      end_date: null,
      description: 'Architected a new payment gateway handling $2M daily transactions.\nMigrated legacy monolithic application to AWS microservices.',
    },
    {
      id: 4,
      job_title: 'Senior Software Engineer',
      company_name: 'TechNova',
      location: 'Dublin, Ireland',
      start_date: '2014-07-01',
      end_date: '2018-12-01',
      description: 'Developed scalable REST APIs using Node.js and TypeScript.\nReduced database query latency by 40%.',
    },
  ],
  educations: [
    {
      id: 3,
      degree: 'BSc Computer Engineering',
      institution_name: 'Trinity College Dublin',
      location: 'Dublin, Ireland',
      start_date: '2010-09-01',
      end_date: '2014-06-01',
      description: 'Dean\'s List for all 4 years.',
    },
  ],
  skills: [
    { id: 6, name: 'TypeScript' },
    { id: 7, name: 'Go' },
    { id: 8, name: 'AWS' },
    { id: 9, name: 'Kubernetes' },
    { id: 10, name: 'System Design' },
  ],
  certificates: [],
  languages: [],
}
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
    <h1 class="text-3xl font-bold mb-4 text-center text-gray-900">
      Template Playground
    </h1>
    <p class="text-center text-gray-600 mb-6">
      Take screenshots of these templates to use as preview images!
    </p>

    <!-- Controls -->
    <div class="flex flex-col gap-4 items-center mb-8">
      <div class="flex gap-4">
        <button
          class="px-5 py-2.5 rounded-xl font-semibold transition-colors"
          :class="activeTab === 'atlantic' ? 'bg-[#F26438] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
          @click="activeTab = 'atlantic'"
        >
          Atlantic (Two-Column)
        </button>
        <button
          class="px-5 py-2.5 rounded-xl font-semibold transition-colors"
          :class="activeTab === 'meridian' ? 'bg-[#F26438] text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'"
          @click="activeTab = 'meridian'"
        >
          Meridian (Single-Column)
        </button>
      </div>

      <div class="flex gap-2 items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
        <span class="text-sm font-semibold text-gray-500 mr-2">Zoom:</span>
        <button
          class="px-3 py-1.5 rounded font-medium text-sm transition-colors"
          :class="scale === 0.5 ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="scale = 0.5"
        >
          50%
        </button>
        <button
          class="px-3 py-1.5 rounded font-medium text-sm transition-colors"
          :class="scale === 0.65 ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="scale = 0.65"
        >
          65%
        </button>
        <button
          class="px-3 py-1.5 rounded font-medium text-sm transition-colors"
          :class="scale === 0.8 ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="scale = 0.8"
        >
          80%
        </button>
        <button
          class="px-3 py-1.5 rounded font-medium text-sm transition-colors"
          :class="scale === 1 ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'"
          @click="scale = 1"
        >
          100%
        </button>
      </div>
    </div>

    <!-- Template Container -->
    <div
      class="w-[850px] min-h-[1100px] bg-white shadow-2xl overflow-hidden rounded-md border border-gray-200 transition-transform duration-300 origin-top mb-24"
      :style="{ transform: `scale(${scale})` }"
    >
      <TwoColumnTemplate
        v-if="activeTab === 'atlantic'"
        :data="mockData1"
      />
      <SingleColumnTemplate
        v-if="activeTab === 'meridian'"
        :data="mockData2"
      />
    </div>
  </div>
</template>
