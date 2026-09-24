<template>
  <div class="min-h-screen flex flex-col bg-[#F9F6F0]">
    <!-- Global Dashboard Header -->
    <LayoutDashboardHeader />

    <div class="flex flex-1 overflow-hidden">
      <!-- Collapsible Sidebar -->
      <LayoutDashboardSidebar />

      <!-- Main Page Content -->
      <main class="flex-1 overflow-y-auto bg-[#F9F6F0]">
        <slot />
      </main>
    </div>
  </div>
</template>
