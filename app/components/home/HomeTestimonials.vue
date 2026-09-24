<template>
  <section
    id="testimonials"
    class="py-20 sm:py-28 bg-stone-900 text-stone-100 relative"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span
          class="text-brand-400 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2 inline-block"
        >Real Career Journeys</span>
        <h2
          class="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4"
        >
          Loved by professionals across Ghana
        </h2>
        <p class="text-stone-300 text-base sm:text-lg">
          Here is what job seekers say about creating their CVs with CraftCV.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(item, idx) in testimonials"
          :key="idx"
          class="p-8 rounded-2xl bg-stone-800/80 border border-stone-700/80 flex flex-col justify-between hover:border-brand-500/60 transition"
        >
          <div>
            <div
              class="flex items-center gap-1 text-amber-400 mb-4"
              role="img"
              aria-label="5 out of 5 stars"
            >
              <span
                v-for="s in 5"
                :key="s"
                class="text-sm"
                aria-hidden="true"
              >★</span>
            </div>
            <p class="text-stone-200 text-sm leading-relaxed mb-6 italic">
              "{{ item.quote }}"
            </p>
          </div>
          <div class="flex items-center gap-3 pt-4 border-t border-stone-700">
            <div
              class="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs tracking-wider flex-shrink-0"
            >
              {{ item.initials }}
            </div>
            <div>
              <h4 class="font-semibold text-sm text-white">
                {{ item.name }}
              </h4>
              <p class="text-xs text-stone-400">
                {{ item.role }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  {
    quote:
      'CraftCV gave me clean, elegant templates that are genuinely professional. Exporting to PDF is flawless every single time. Had my CV ready in under 15 minutes!',
    name: 'Kwame Asante',
    role: 'Product Manager at Hubtel',
    initials: 'KA',
  },
  {
    quote:
      'Managing multiple CV versions for different roles is completely effortless. The interface is intuitive, fast, and gets straight to the point.',
    name: 'Abena Mensah',
    role: 'UX Designer at mPharma',
    initials: 'AM',
  },
  {
    quote:
      'The template library is remarkable. I had my CV looking exactly the way I wanted in under 20 minutes \u2014 no fuss, just clean results.',
    name: 'James Osei',
    role: 'Software Engineer at Paystack',
    initials: 'JO',
  },
]
</script>
