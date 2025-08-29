<script setup lang="ts">
import { ASSETS } from '@/consts'
import { useAuth } from '@/stores/auth'
const auth = useAuth()
</script>

<template>
  <img class="float-end w-25" :src="ASSETS.portrait" alt="Character Portrait" />
  <h1>Home</h1>
  <p>
    Welcome to Rhythmly! This is an online platform where you can create and share your own rhythm
    charts and play charts others have created.
  </p>
  <p>
    The authentication system is based on rhythm passwords, which means you can log in by playing a
    specific rhythm pattern that you create while listening to an audio clip that you uploaded when
    you registered.
  </p>
  <h2>Profile</h2>
  <p v-if="auth.isLoggedIn">You are logged in as {{ auth.username }}.</p>
  <p v-else>
    You are not logged in. <RouterLink to="/login">Login</RouterLink> or
    <RouterLink to="/register">register an account</RouterLink> to upload and play charts!
  </p>
</template>
