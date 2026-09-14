import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  components: [
    {
      path: "~/components",
      extensions: ["vue"],
    },
  ],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ["shadcn-nuxt","@nuxt/image"],

  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },
});