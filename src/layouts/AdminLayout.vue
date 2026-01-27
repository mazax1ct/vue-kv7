<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <AppHeader />

  <main class="p-3 p-lg-5">
      <slot></slot>
  </main>

  <AppFooter />
</template>
