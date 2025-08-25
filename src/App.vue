<script setup lang="ts">
import WebsiteHeader from './components/WebsiteHeader.vue'
</script>

<template>
  <div class="main-layout">
    <WebsiteHeader class="main-header"></WebsiteHeader>
    <div class="main-content">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding: 1em;
  color: #5d4037;
}
</style>
