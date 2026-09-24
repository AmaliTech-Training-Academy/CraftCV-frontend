<template>
  <!-- Live Interactive CV Preview Section -->
  <section
    id="preview"
    class="py-16 sm:py-24 bg-stone-900 text-stone-100 relative overflow-hidden"
  >
    <!-- Background subtle glow -->
    <div
      class="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"
    />
    <div
      class="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl pointer-events-none"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span
          class="text-brand-400 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
        >Interactive Preview</span>
        <h2
          class="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4"
        >
          See your CV come together live
        </h2>
        <p class="text-stone-300 text-base sm:text-lg">
          Click different professions below to see how our editor neatly
          organizes and styles your details.
        </p>

        <!-- Role Selector Controls -->
        <div
          class="mt-8 flex flex-wrap items-center justify-center gap-2"
          role="tablist"
          aria-label="Interactive Preview Role Selection"
        >
          <button
            v-for="role in sampleRoles"
            :key="role.id"
            type="button"
            role="tab"
            :aria-selected="selectedRoleId === role.id"
            :class="[
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border whitespace-nowrap',
              selectedRoleId === role.id
                ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/30'
                : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:border-stone-500',
            ]"
            @click="selectedRoleId = role.id"
          >
            {{ role.title }}
          </button>
        </div>
      </div>

      <!-- Mock Editor App Window -->
      <div
        class="rounded-2xl border border-stone-700/80 bg-stone-950/90 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl"
      >
        <!-- Window Toolbar -->
        <div
          class="px-4 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span
              class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"
            />
            <span
              class="w-3 h-3 rounded-full bg-green-500/80 inline-block"
            />
            <span
              class="text-xs text-stone-400 font-mono ml-2 hidden sm:inline-block"
            >craftcv.app/editor/{{ currentRole.slug }}</span>
          </div>

          <!-- Format Switcher Badges -->
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-1 rounded-md bg-stone-800 text-[11px] font-mono text-stone-300 border border-stone-700"
            >
              PDF Standard
            </span>
            <span
              class="px-2.5 py-1 rounded-md bg-stone-800 text-[11px] font-mono text-emerald-400 border border-emerald-500/30"
            >
              Ready to Export
            </span>
          </div>
        </div>

        <!-- Editor Body -->
        <div
          class="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-800"
        >
          <!-- Left Sidebar: Sections & Tools -->
          <div class="lg:col-span-4 p-5 sm:p-6 bg-stone-900/50 space-y-6">
            <!-- Document Details Box -->
            <div
              class="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3"
            >
              <div class="flex items-center justify-between">
                <span
                  class="text-xs font-semibold uppercase tracking-wider text-stone-400"
                >Active Template</span>
                <span
                  class="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30"
                >Executive</span>
              </div>
              <p class="text-xs text-stone-300 leading-snug">
                Balanced typography, clean margins, and clear structural
                hierarchy designed for instant readability.
              </p>
            </div>

            <!-- CV Sections Checklist -->
            <div class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-2"
              >CV Sections</span>
              <div class="space-y-1.5 text-xs text-stone-300">
                <div
                  class="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-success font-bold">✓</span> Contact &
                    Header Info
                  </span>
                  <span class="text-stone-500">Filled</span>
                </div>
                <div
                  class="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-success font-bold">✓</span>
                    Professional Summary
                  </span>
                  <span class="text-stone-500">Filled</span>
                </div>
                <div
                  class="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-success font-bold">✓</span> Work
                    Experience (1)
                  </span>
                  <span class="text-stone-500">Filled</span>
                </div>
                <div
                  class="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800"
                >
                  <span class="flex items-center gap-2">
                    <span class="text-success font-bold">✓</span> Skills &
                    Tools ({{ currentRole.skills.length }})
                  </span>
                  <span class="text-stone-500">Filled</span>
                </div>
              </div>
            </div>

            <!-- Skills Chip Preview -->
            <div class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-wider text-stone-400 block"
              >Skills Preview</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="kw in currentRole.skills.slice(0, 5)"
                  :key="kw"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700"
                >
                  {{ kw }}
                </span>
              </div>
            </div>

            <div class="pt-2">
              <NuxtLink
                to="/register"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30 whitespace-nowrap"
              >
                Open Full Editor
                <svg
                  aria-hidden="true"
                  class="w-4 h-4 ml-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Right Center: Live Resume Document Sheet Mockup -->
          <div
            class="lg:col-span-8 p-4 sm:p-8 bg-stone-950/60 flex items-center justify-center"
          >
            <div
              class="w-full max-w-2xl bg-white text-stone-900 rounded-xl p-6 sm:p-10 shadow-2xl border border-stone-200/90 relative"
            >
              <!-- Sheet Header -->
              <div
                class="border-b border-stone-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3
                    class="font-display text-2xl font-bold text-stone-900 tracking-tight"
                  >
                    {{ currentRole.candidateName }}
                  </h3>
                  <p class="text-brand-600 font-semibold text-sm mt-0.5">
                    {{ currentRole.title }}
                  </p>
                </div>
                <div
                  class="text-xs text-stone-500 sm:text-right space-y-0.5"
                >
                  <p>{{ currentRole.email }}</p>
                  <p>
                    {{ currentRole.location }} • {{ currentRole.phone }}
                  </p>
                  <p class="text-brand-700 font-medium">
                    portfolio.dev/profile
                  </p>
                </div>
              </div>

              <!-- Professional Summary -->
              <div class="mb-5">
                <h4
                  class="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-1 mb-2"
                >
                  Professional Summary
                </h4>
                <p class="text-xs text-stone-600 leading-relaxed">
                  {{ currentRole.summary }}
                </p>
              </div>

              <!-- Experience Section -->
              <div class="mb-5">
                <h4
                  class="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-1 mb-2"
                >
                  Work Experience
                </h4>
                <div class="space-y-3">
                  <div
                    v-if="
                      currentRole.experience && currentRole.experience[0]
                    "
                  >
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-stone-900">{{ currentRole.experience[0].role }} —
                        <span class="text-brand-600 font-medium">{{
                          currentRole.experience[0].company
                        }}</span></span>
                      <span class="text-stone-400 font-mono text-[11px]">{{
                        currentRole.experience[0].period
                      }}</span>
                    </div>
                    <ul
                      class="mt-1.5 list-disc list-inside text-xs text-stone-600 space-y-1"
                    >
                      <li
                        v-for="(point, pIdx) in currentRole.experience[0]
                          .highlights"
                        :key="pIdx"
                      >
                        <span class="font-medium text-stone-800">{{ point.split(":")[0] }}:</span>{{ point.split(":")[1] }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Skills Section -->
              <div>
                <h4
                  class="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-100 pb-1 mb-2"
                >
                  Key Competencies & Technologies
                </h4>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="skill in currentRole.skills"
                    :key="skill"
                    class="px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700 font-medium border border-stone-200"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface RoleDemo {
  id: string
  title: string
  slug: string
  candidateName: string
  email: string
  location: string
  phone: string
  summary: string
  skills: string[]
  experience: Array<{
    role: string
    company: string
    period: string
    highlights: string[]
  }>
}

const sampleRoles: RoleDemo[] = [
  {
    id: 'swe',
    title: 'Senior Software Engineer',
    slug: 'kwame-mensah-swe',
    candidateName: 'Kwame Mensah',
    email: 'kwame.mensah@craftcv.io',
    location: 'Accra, Ghana',
    phone: '+233 24 123 4567',
    summary:
      'High-impact Full Stack Engineer with 7+ years architecting cloud-native distributed microservices, TypeScript/Vue/Nuxt frontends, and reliable web applications.',
    skills: [
      'TypeScript',
      'Vue 3',
      'Nuxt 4',
      'Node.js',
      'Go',
      'Docker',
      'Kubernetes',
      'PostgreSQL',
      'Redis',
      'AWS',
    ],
    experience: [
      {
        role: 'Lead Frontend Engineer',
        company: 'Hubtel',
        period: '2022 — Present',
        highlights: [
          'Architecture Refactor: Redesigned high-throughput web client, cutting bundle size by 54% and improving load times by 1.8s.',
          'Team Leadership: Mentored a team of 8 engineers and introduced automated testing standards across product lines.',
        ],
      },
    ],
  },
  {
    id: 'pm',
    title: 'Lead Product Manager',
    slug: 'abena-osei-pm',
    candidateName: 'Abena Osei',
    email: 'abena.pm@craftcv.io',
    location: 'Kumasi, Ghana',
    phone: '+233 20 987 6543',
    summary:
      'Customer-focused Product Leader with a track record of scaling B2B SaaS products from $2M to $25M ARR. Experienced in product strategy, roadmap planning, and agile teams.',
    skills: [
      'Product Strategy',
      'Roadmapping',
      'User Research',
      'A/B Testing',
      'SQL',
      'Mixpanel',
      'Figma',
      'Agile/Scrum',
    ],
    experience: [
      {
        role: 'Principal Product Manager',
        company: 'Paystack Ghana',
        period: '2021 — Present',
        highlights: [
          'Product-Led Growth: Led user onboarding redesign, boosting 30-day user activation rate from 28% to 64%.',
          'Market Expansion: Launched multi-currency checkout experience across new territories.',
        ],
      },
    ],
  },
  {
    id: 'ux',
    title: 'Senior Product Designer',
    slug: 'yaw-appiah-ux',
    candidateName: 'Yaw Appiah',
    email: 'yaw.ux@craftcv.io',
    location: 'Tema, Ghana',
    phone: '+233 55 456 7890',
    summary:
      'Design systems architect and product designer dedicated to creating accessible, high-conversion enterprise interfaces and clean mobile experiences.',
    skills: [
      'Figma',
      'Design Systems',
      'Interaction Design',
      'WCAG AAA',
      'Rapid Prototyping',
      'Information Architecture',
      'CSS/Tokens',
    ],
    experience: [
      {
        role: 'Staff Product Designer',
        company: 'mPharma',
        period: '2023 — Present',
        highlights: [
          'Design System Architecture: Established cross-platform design token pipeline, unifying 6 core product surfaces.',
          'Conversion Optimization: Overhauled checkout funnels, leading to a 22% uplift in free-to-paid conversion.',
        ],
      },
    ],
  },
]

const selectedRoleId = ref<string>('swe')
const currentRole = computed(() => {
  return (
    sampleRoles.find(r => r.id === selectedRoleId.value) || sampleRoles[0]!
  )
})
</script>
