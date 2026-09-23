// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    'shadcn-nuxt',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@nuxt/image',
  ],

  devtools: {
    enabled: true,
  },

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

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Relative on purpose. nginx serves this app and proxies /api to
      // Django on the same host, so the browser calls its own origin and no
      // server address is ever baked into the bundle. That matters here: the
      // sandbox stops overnight and comes back with a different public IP,
      // which would break any hardcoded address every morning.
      //
      // Override with NUXT_PUBLIC_API_BASE when the API lives elsewhere.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
    },
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      // /login is not yet implemented (owned by a separate PR).
      // Ignore it so `nuxt generate` does not fail on the 404.
      // Remove this entry once app/pages/(auth)/login.vue is merged.
      ignore: ['/login'],
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  typescript: {
    tsConfig: {
      include: [
        '../tests/**/*.ts',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
