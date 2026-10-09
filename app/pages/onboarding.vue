<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboarding, type CareerLevel, type CvPurpose } from '~/composables/useOnboarding'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const router = useRouter()
const { setCareerLevel, setCvPurpose, preferences } = useOnboarding()

const selectedLevel = ref<CareerLevel>(preferences.value.careerLevel)
const selectedPurpose = ref<CvPurpose>(preferences.value.cvPurpose)

const careerOptions: { value: CareerLevel, label: string, desc: string, icon: string }[] = [
  { value: 'entry', label: 'Entry-level Professional', desc: '0–2 years of experience · Building early impact & skill endorsements', icon: 'i-ph-seedling-light' },
  { value: 'mid', label: 'Mid-level', desc: '3–7 years of experience · Growing leadership, ownership & project outcomes', icon: 'i-ph-trend-up-light' },
  { value: 'executive', label: 'Executive / Leadership', desc: '15+ years · C-suite, VP, board level oversight & enterprise impact', icon: 'i-ph-buildings-light' },
]

const purposeOptions: { value: CvPurpose, label: string, desc: string, icon: string }[] = [
  { value: 'job_search', label: 'Job search', desc: 'Active market', icon: 'i-ph-briefcase-light' },
  { value: 'school', label: 'School application', desc: 'Academic & grad', icon: 'i-ph-graduation-cap-light' },
  { value: 'freelance', label: 'Freelance / portfolio', desc: 'Client projects', icon: 'i-ph-squares-four-light' },
  { value: 'ready', label: 'Just keeping it ready', desc: 'Passive update', icon: 'i-ph-clock-light' },
]

const canContinue = computed(() => selectedLevel.value !== null)

const handleContinue = () => {
  if (!selectedLevel.value) return
  setCareerLevel(selectedLevel.value)
  if (selectedPurpose.value) {
    setCvPurpose(selectedPurpose.value)
  }
  router.push('/cvs/new')
}

const handleSkip = () => {
  router.push('/cvs/new')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F9F7F5] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-3xl">
      <!-- Progress Indicator -->
      <div class="flex justify-center mb-8 gap-2">
        <div class="w-12 h-1 bg-[#F26438] rounded-full" />
        <div class="w-12 h-1 bg-stone-200 rounded-full" />
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-stone-100 p-8 md:p-12">
        <!-- Career Level -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-stone-900 tracking-tight">
              Where are you in your career?
            </h2>
            <span class="bg-[#F26438] text-white text-xs px-2 py-0.5 rounded-full font-medium">Required</span>
          </div>
          <p class="text-stone-500 mb-6 text-sm">
            We'll pre-configure your resume structure, visual density, and highlight sections accordingly.
          </p>

          <div class="flex flex-col gap-3">
            <button
              v-for="opt in careerOptions"
              :key="opt.value as string"
              :class="[
                'flex items-center p-4 rounded-lg border text-left transition-all duration-200',
                selectedLevel === opt.value
                  ? 'border-[#F26438] bg-orange-50/30'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50',
              ]"
              @click="selectedLevel = opt.value"
            >
              <div class="text-stone-400 mr-4">
                <UIcon
                  :name="opt.icon"
                  class="w-5 h-5"
                />
              </div>
              <div class="flex-1">
                <span class="font-semibold text-stone-900">{{ opt.label }}</span>
                <span class="text-stone-500 text-sm ml-2">{{ opt.desc }}</span>
              </div>
              <div class="ml-4 flex-shrink-0">
                <div
                  v-if="selectedLevel === opt.value"
                  class="w-5 h-5 rounded-full bg-[#F26438] flex items-center justify-center text-white"
                >
                  <UIcon
                    name="i-ph-check-bold"
                    class="w-3 h-3"
                  />
                </div>
                <div
                  v-else
                  class="w-5 h-5 rounded-full border-2 border-stone-300"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- CV Purpose -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-2xl font-bold text-stone-900 tracking-tight">
              What's this CV for?
            </h2>
            <span class="bg-white text-[#F26438] border border-[#F26438] text-xs px-2 py-0.5 rounded-full font-medium">Optional</span>
          </div>
          <p class="text-stone-500 mb-6 text-sm">
            Helps calibrate typesetting tone, emphasis on publications/portfolio, and section arrangement.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              v-for="opt in purposeOptions"
              :key="opt.value as string"
              :class="[
                'flex flex-col p-4 rounded-lg border text-left transition-all duration-200 relative',
                selectedPurpose === opt.value
                  ? 'border-[#F26438] bg-orange-50/30'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50',
              ]"
              @click="selectedPurpose = opt.value"
            >
              <div class="text-stone-500 mb-6">
                <UIcon
                  :name="opt.icon"
                  class="w-5 h-5"
                />
              </div>
              <div class="mt-auto">
                <div class="font-semibold text-stone-900 text-sm mb-1">
                  {{ opt.label }}
                </div>
                <div class="text-stone-500 text-xs">
                  {{ opt.desc }}
                </div>
              </div>

              <!-- Checkmark absolute top right -->
              <div
                v-if="selectedPurpose === opt.value"
                class="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#DE5B38] flex items-center justify-center text-white"
              >
                <UIcon
                  name="i-ph-check-bold"
                  class="w-3 h-3"
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
            <UIcon
              name="i-ph-arrow-right-bold"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
