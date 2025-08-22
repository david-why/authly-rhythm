<script setup lang="ts">
import WebsiteHeader from './components/WebsiteHeader.vue'
</script>

<template>
  <div class="main-layout">
    <WebsiteHeader></WebsiteHeader>
  </div>
</template>

<style scoped>
.main-layout {
  display: grid;
  grid-template-areas:
    'header'
    'content'
    'footer';
  grid-template-rows: auto 1fr auto;
}
</style>
