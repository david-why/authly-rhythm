<script setup lang="ts">
import { useAuth } from './stores/auth'
const auth = useAuth()
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg sticky-top bg-body-tertiary" data-bs-theme="dark">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">Rhythmly</RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/' }"
                :aria-current="$route.path === '/' ? 'page' : undefined"
                to="/"
                >Home</RouterLink
              >
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" v-if="!auth.isLoggedIn">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/register' }"
                :aria-current="$route.path === '/register' ? 'page' : undefined"
                to="/register"
                >Register</RouterLink
              >
            </li>
            <li class="nav-item" v-if="!auth.isLoggedIn">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/login' }"
                :aria-current="$route.path === '/login' ? 'page' : undefined"
                to="/login"
                >Sign in</RouterLink
              >
            </li>
            <li class="nav-item" v-if="auth.isLoggedIn">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/user' }"
                :aria-current="$route.path === '/user' ? 'page' : undefined"
                to="/user"
                >User</RouterLink
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="container mt-4 bg-body">
      <RouterView></RouterView>
    </main>
  </div>
</template>
