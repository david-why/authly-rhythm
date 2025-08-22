<script setup lang="ts">
defineProps<{
  path: string
}>()
</script>

<template>
  <svg viewBox="0 0 24 24" class="md-icon">
    <path :d="path" fill="currentColor" />
  </svg>
</template>

<style lang="css">
.md-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: baseline;
}
</style>
