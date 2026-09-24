<template>
  <footer class="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div class="col-span-2 space-y-4">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2.5"
            aria-label="CraftCV Home"
          >
            <div
              class="p-1 rounded-lg bg-white inline-flex items-center justify-center"
            >
              <img
                src="/craftcv-logo.png"
                alt="CraftCV"
                class="h-6 w-auto"
              >
            </div>
            <span
              class="font-display font-bold text-xl text-white tracking-tight"
            >Craft<span class="text-brand-500">CV</span></span>
          </NuxtLink>
          <p class="text-xs text-stone-400 leading-relaxed max-w-sm">
            The modern CV maker empowering ambitious professionals to craft
            clean, beautifully styled resumes with real-time editing and instant
            PDF export.
          </p>
          <p class="text-xs text-stone-400">
            &copy; {{ new Date().getFullYear() }} CraftCV, Inc. All rights
            reserved.
          </p>
        </div>

        <nav aria-label="Product Navigation">
          <h4
            class="text-xs font-semibold uppercase tracking-wider text-white mb-3"
          >
            Product
          </h4>
          <ul class="text-xs space-y-2">
            <li>
              <a
                href="#how-it-works"
                class="hover:text-brand-400 transition"
              >How It Works</a>
            </li>

            <li>
              <a
                href="#preview"
                class="hover:text-brand-400 transition"
              >Live Editor</a>
            </li>
            <li>
              <a
                href="#features"
                class="hover:text-brand-400 transition"
              >Features</a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Resources Navigation">
          <h4
            class="text-xs font-semibold uppercase tracking-wider text-white mb-3"
          >
            Resources
          </h4>
          <ul class="text-xs space-y-2">
            <li>
              <a
                href="#faq"
                class="hover:text-brand-400 transition"
              >FAQ</a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account Navigation">
          <h4
            class="text-xs font-semibold uppercase tracking-wider text-white mb-3"
          >
            Account
          </h4>
          <ul class="text-xs space-y-2">
            <li>
              <NuxtLink
                to="/login"
                class="hover:text-brand-400 transition"
              >Sign in</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/register"
                class="hover:text-brand-400 transition"
              >Create Account</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>
