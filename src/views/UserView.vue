<script setup lang="ts">
import { useAuth } from '@/stores/auth'
import { computed } from 'vue'
const auth = useAuth()

const isLoggedIn = computed(() => auth.isLoggedIn)
const username = computed(() => auth.username)

function signOut() {
  auth.logout()
}
</script>

<template>
  <h1>User</h1>
  <template v-if="isLoggedIn">
    <p>
      You are signed in as <strong>{{ username }}</strong
      >.
    </p>
    <button class="btn btn-danger" @click="signOut">Sign out</button>
  </template>
  <template v-else>
    <p>You are not signed in.</p>
    <RouterLink class="btn btn-primary" to="/login">Sign in</RouterLink>
  </template>
</template>
