<script setup lang="ts">
// Temporary: redirects to /forgot-password while login is being built by colleagues.
// Once login is added at pages/(auth)/login.vue, change '/forgot-password' to '/login'.
await navigateTo('/forgot-password', { replace: true })
</script>
