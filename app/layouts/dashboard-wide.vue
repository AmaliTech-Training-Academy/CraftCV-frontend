<template>
  <div class="min-h-screen flex flex-col bg-[#F9F6F0]">
    <!-- Global Dashboard Header -->
    <LayoutDashboardHeader />

    <!-- Main Page Content — no sidebar -->
    <main class="flex-1 overflow-y-auto bg-[#F9F6F0]">
      <slot />
    </main>
  </div>
</template>
