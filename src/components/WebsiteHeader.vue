<script setup lang="ts"></script>

<template>
  <div class="wrapper">
    <h1 class="title" @click="$router.push('/')">Rhythmly</h1>
    <span class="divider"></span>
    <div class="button" @click="$router.push('/login')">Sign in</div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  background-color: #2c3e50;
  color: #ecf0f1;
  height: 4em;
  padding: 0 1em;
}
.title {
  font-size: 1.5rem;
  cursor: pointer;
}
.divider {
  flex: 1 0 0;
}
.button {
  padding: 1em;
  cursor: pointer;
}
.button:hover {
  background-color: #34495e;
}
</style>
