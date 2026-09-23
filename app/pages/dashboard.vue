<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-50">
    <div
      class="bg-white p-8 rounded-xl shadow-sm border border-stone-100 text-center max-w-md w-full"
    >
      <h1 class="text-3xl font-display font-semibold text-stone-900 mb-4">
        Dashboard
      </h1>
      <p class="text-stone-600 mb-8">
        Welcome to your protected CV dashboard!
      </p>

      <button
        class="w-full rounded-[10px] bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition"
        @click="handleLogout"
      >
        Log out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
