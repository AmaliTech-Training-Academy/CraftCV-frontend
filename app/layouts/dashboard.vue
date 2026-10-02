<script setup lang="ts">
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-[#F9F6F0]">
    <!-- Global Dashboard Header -->
    <LayoutDashboardHeader />

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar: desktop always visible -->
      <LayoutDashboardSidebar />

      <!-- Main Page Content -->
      <main class="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[#F9F6F0]">
        <slot />
      </main>
    </div>
  </div>
</template>
