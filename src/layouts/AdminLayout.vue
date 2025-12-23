<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <AppHeader />

  <main class="p-3 p-lg-5">
      <slot />
  </main>
  
  <AppFooter />
</template>
