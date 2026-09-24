<template>
  <section
    id="faq"
    class="py-20 sm:py-28 bg-stone-50"
  >
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span
          class="text-brand-600 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
        >Got Questions?</span>
        <h2
          class="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight mb-4"
        >
          Frequently Asked Questions
        </h2>
        <p class="text-stone-600 text-base">
          Everything you need to know about building your CV with CraftCV.
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="(faq, fIdx) in faqs"
          :key="fIdx"
          class="rounded-xl border border-stone-200 bg-white overflow-hidden transition-all duration-200"
        >
          <button
            type="button"
            class="w-full p-5 text-left font-display font-semibold text-base sm:text-lg text-stone-900 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            :aria-expanded="openFaqIndex === fIdx"
            :aria-controls="'faq-answer-' + fIdx"
            @click="toggleFaq(fIdx)"
          >
            <span>{{ faq.question }}</span>
            <span
              aria-hidden="true"
              class="transform transition-transform text-brand-600 text-xl font-bold"
              :class="openFaqIndex === fIdx ? 'rotate-45' : ''"
            >+</span>
          </button>
          <div
            v-if="openFaqIndex === fIdx"
            :id="'faq-answer-' + fIdx"
            class="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const openFaqIndex = ref<number | null>(0)

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const faqs = [
  {
    question: 'Is CraftCV free to use?',
    answer:
      'Yes! CraftCV includes a generous free tier that lets you choose a template, enter your experience, and download high-resolution PDFs without any hidden fees.',
  },
  {
    question: 'How do I download my CV?',
    answer:
      'Once you are done filling in your details, click the Export / Download PDF button. Your CV will immediately export as a vector-crisp PDF ready for job applications.',
  },
  {
    question: 'Can I create and manage multiple CVs?',
    answer:
      'Yes. In your CraftCV account, you can create and maintain different versions of your CV for different job applications and career paths.',
  },
  {
    question: 'Is my personal information kept private?',
    answer:
      'Absolutely. We take your privacy seriously. We never sell, share, or distribute your personal details or CV content to third parties or recruiters.',
  },
]
</script>
