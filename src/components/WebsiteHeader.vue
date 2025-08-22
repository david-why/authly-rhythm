<script setup lang="ts">
import { mdiLogin } from '@mdi/js'
import MDIcon from './MDIcon.vue'
</script>

<template>
  <div class="main-header">
    <h1 class="title">Rhythmly</h1>
    <span class="divider"></span>
    <div><MDIcon :path="mdiLogin"></MDIcon> Sign in</div>
  </div>
</template>

<style scoped>
.main-header {
  display: flex;
  align-items: center;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
}
.title {
  font-size: 1.5rem;
}
.divider {
  flex: 1 0 0;
}
</style>
