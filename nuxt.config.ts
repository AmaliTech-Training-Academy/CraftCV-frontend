// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // @nuxt/eslint and @nuxt/test-utils/module removed from modules until packages are installed
  // Re-add them once: npm install @nuxt/eslint @nuxt/test-utils
  modules: ['shadcn-nuxt', '@nuxt/eslint', '@nuxt/test-utils/module'],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-15',

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // eslint config (restore when @nuxt/eslint is installed):
  // eslint: { config: { stylistic: true } },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
