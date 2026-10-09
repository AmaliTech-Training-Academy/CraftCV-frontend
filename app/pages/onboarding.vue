<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboarding, type CareerLevel, type CvPurpose } from '~/composables/useOnboarding'
import { Sprout, TrendingUp, Building, Briefcase, GraduationCap, LayoutGrid, Clock, Check, ArrowRight } from '@lucide/vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const router = useRouter()
const { setCareerLevel, setCvPurpose, preferences } = useOnboarding()

const selectedLevel = ref<CareerLevel>(preferences.value.careerLevel)
const selectedPurpose = ref<CvPurpose>(preferences.value.cvPurpose)

const careerOptions: { value: CareerLevel, label: string, desc: string, icon: any }[] = [
  { value: 'entry', label: 'Entry-level Professional', desc: '0–2 years of experience · Building early impact & skill endorsements', icon: Sprout },
  { value: 'mid', label: 'Mid-level', desc: '3–7 years of experience · Growing leadership, ownership & project outcomes', icon: TrendingUp },
  { value: 'executive', label: 'Executive / Leadership', desc: '15+ years · C-suite, VP, board level oversight & enterprise impact', icon: Building },
]

const purposeOptions: { value: CvPurpose, label: string, desc: string, icon: any }[] = [
  { value: 'job_search', label: 'Job search', desc: 'Active market', icon: Briefcase },
  { value: 'school', label: 'School application', desc: 'Academic & grad', icon: GraduationCap },
  { value: 'freelance', label: 'Freelance / portfolio', desc: 'Client projects', icon: LayoutGrid },
  { value: 'ready', label: 'Just keeping it ready', desc: 'Passive update', icon: Clock },
]

const canContinue = computed(() => selectedLevel.value !== null)

const handleContinue = () => {
  if (!selectedLevel.value) return
  setCareerLevel(selectedLevel.value)
  if (selectedPurpose.value) {
    setCvPurpose(selectedPurpose.value)
  }
  router.push('/templates')
}

const handleSkip = () => {
  router.push('/templates')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F9F7F5] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-3xl">
      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-8 md:p-12">
        <div class="mb-10 text-center">
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
            Welcome to CraftCV!
          </h1>
          <p class="text-slate-500">
            We just want to ask a few quick questions to tailor your experience.
          </p>
        </div>

        <!-- Career Level -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-xl font-bold text-slate-800 tracking-tight">
              Where are you in your career?
            </h2>
            <span class="bg-orange-50 text-orange-600 border border-orange-100/50 text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-full font-bold">Required</span>
          </div>
          <p class="text-slate-500 mb-6 text-sm">
            We'll pre-configure your resume structure, visual density, and highlight sections accordingly.
          </p>

          <div class="flex flex-col gap-3">
            <button
              v-for="opt in careerOptions"
              :key="opt.value as string"
              :class="[
                'group flex items-center p-4 rounded-xl border text-left transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                selectedLevel === opt.value
                  ? 'border-[#F26438] ring-1 ring-[#F26438] shadow-sm bg-white'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 bg-white',
              ]"
              @click="selectedLevel = opt.value"
            >
              <div
                class="mr-4 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                :class="selectedLevel === opt.value ? 'bg-orange-50 text-[#F26438]' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'"
              >
                <component
                  :is="opt.icon"
                  class="w-5 h-5"
                />
              </div>
              <div class="flex-1">
                <span
                  class="font-semibold transition-colors duration-300"
                  :class="selectedLevel === opt.value ? 'text-slate-900' : 'text-slate-700'"
                >{{ opt.label }}</span>
                <span class="text-slate-500 text-sm ml-2">{{ opt.desc }}</span>
              </div>
              <div class="ml-4 flex-shrink-0">
                <div
                  v-if="selectedLevel === opt.value"
                  class="w-5 h-5 rounded-full bg-[#F26438] flex items-center justify-center text-white animate-in zoom-in duration-200"
                >
                  <Check
                    class="w-3.5 h-3.5"
                    stroke-width="3"
                  />
                </div>
                <div
                  v-else
                  class="w-5 h-5 rounded-full border-2 border-slate-200 transition-colors duration-300 group-hover:border-slate-300"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- CV Purpose -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-xl font-bold text-slate-800 tracking-tight">
              What's this CV for?
            </h2>
            <span class="bg-slate-50 text-slate-500 border border-slate-200 text-[11px] uppercase tracking-wide px-2.5 py-0.5 rounded-full font-bold">Optional</span>
          </div>
          <p class="text-slate-500 mb-6 text-sm">
            Helps calibrate typesetting tone, emphasis on publications/portfolio, and section arrangement.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              v-for="opt in purposeOptions"
              :key="opt.value as string"
              :class="[
                'group flex flex-col p-4 rounded-xl border text-left transition-all duration-300 ease-out relative outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                selectedPurpose === opt.value
                  ? 'border-[#F26438] ring-1 ring-[#F26438] shadow-sm bg-white'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 bg-white',
              ]"
              @click="selectedPurpose = opt.value"
            >
              <div
                class="mb-5 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                :class="selectedPurpose === opt.value ? 'bg-orange-50 text-[#F26438]' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'"
              >
                <component
                  :is="opt.icon"
                  class="w-5 h-5"
                />
              </div>
              <div class="mt-auto">
                <div
                  class="font-semibold text-sm mb-1 transition-colors duration-300"
                  :class="selectedPurpose === opt.value ? 'text-slate-900' : 'text-slate-700'"
                >
                  {{ opt.label }}
                </div>
                <div class="text-slate-500 text-xs">
                  {{ opt.desc }}
                </div>
              </div>

              <!-- Checkmark absolute top right -->
              <div
                v-if="selectedPurpose === opt.value"
                class="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#F26438] flex items-center justify-center text-white animate-in zoom-in duration-200"
              >
                <Check
                  class="w-3.5 h-3.5"
                  stroke-width="3"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-stone-100 mt-8">
          <button
            class="text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors underline underline-offset-4"
            @click="handleSkip"
          >
            Skip to Templates
          </button>
          <button
            :disabled="!canContinue"
            :class="[
              'px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 transition-all',
              canContinue ? 'bg-[#DE5B38] hover:bg-[#c85232]' : 'bg-stone-300 cursor-not-allowed',
            ]"
            @click="handleContinue"
          >
            Continue
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
