<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { API_BASE_URL, ASSETS } from '@/consts'
import { useAuth } from '@/stores/auth'
import type { Chart } from '@/types'
import { computed, ref, watch } from 'vue'
const auth = useAuth()

const CHART_LIMIT = 10

const chartsLoading = ref(false)
const chartError = ref('')
const charts = ref<Chart[]>([])
const chartsPage = ref(1)
const chartTotal = ref(0)
const chartMaxPage = computed(() => Math.ceil(chartTotal.value / CHART_LIMIT))

watch(
  chartsPage,
  () => {
    updateCharts()
  },
  { immediate: true },
)

const displayCharts = computed(() =>
  charts.value.map((chart) => {
    const createdAt = new Date(chart.createdAt)
    return {
      ...chart,
      createdAt,
      displayCreatedAt: createdAt.toLocaleString(),
      isoCreatedAt: createdAt.toISOString(),
    }
  }),
)

async function updateCharts() {
  if (!auth.isLoggedIn) return
  chartsLoading.value = true

  try {
    const res = await fetch(
      `${API_BASE_URL}/charts?page=${chartsPage.value}&limit=${CHART_LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      },
    )
    if (!res.ok) {
      chartError.value = `Error fetching charts: ${res.status} ${res.statusText}`
      return
    }
    const data = await res.json()
    charts.value = data
    chartTotal.value = Number(res.headers.get('X-Total-Count') || '0')
  } finally {
    chartsLoading.value = false
  }
}
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
  <p>
    For more information,
    <a href="https://github.com/david-why/authly-rhythm/blob/main/README.md" target="_blank"
      >check out the documentation here!</a
    >
  </p>
  <h2>Profile</h2>
  <p v-if="auth.isLoggedIn">
    You are logged in as <strong>{{ auth.username }}</strong
    >. Welcome back!
  </p>
  <p v-else>
    You are not logged in. <RouterLink to="/login">Login</RouterLink> or
    <RouterLink to="/register">register an account</RouterLink> to create and play charts!
  </p>
  <div class="clearfix"></div>
  <template v-if="auth.isLoggedIn">
    <h2>Recent charts</h2>
    <p class="alert alert-danger" v-if="chartError">{{ chartError }}</p>
    <p class="alert alert-info" v-else-if="chartsLoading"><LoadingSpinner /> Loading charts...</p>
    <div v-else-if="charts.length">
      <div class="mb-3 card shadow-sm" v-for="chart in displayCharts" :key="chart.id">
        <div class="card-body">
          <h5 class="card-title">{{ chart.title }}</h5>
          <h6 class="card-subtitle text-body-secondary mb-2">
            Created by {{ chart.userUsername }} |
            <time :datetime="chart.isoCreatedAt">{{ chart.displayCreatedAt }}</time>
          </h6>
          <ul class="card-text mb-2">
            <li>Key presses: {{ chart.keyPresses.length }}</li>
          </ul>
          <RouterLink
            class="card-link btn btn-primary pt-1 pb-1"
            :to="{ name: 'play', params: { id: chart.id } }"
            >Play</RouterLink
          >
        </div>
      </div>
      <small class="text-muted">Page {{ chartsPage }} of {{ chartMaxPage }}</small>
      <nav aria-label="Chart pagination">
        <ul class="pagination">
          <li class="page-item">
            <a class="page-link" @click="chartsPage = 1" :class="{ disabled: chartsPage === 1 }"
              >First</a
            >
          </li>
          <li class="page-item">
            <a class="page-link" @click="chartsPage--" :class="{ disabled: chartsPage === 1 }"
              >Previous</a
            >
          </li>
          <li class="page-item">
            <a
              class="page-link"
              @click="chartsPage++"
              :class="{ disabled: chartsPage === chartMaxPage }"
              >Next</a
            >
          </li>
          <li class="page-item">
            <a
              class="page-link"
              @click="chartsPage = chartMaxPage"
              :class="{ disabled: chartsPage === chartMaxPage }"
              >Last</a
            >
          </li>
        </ul>
      </nav>
      <p><RouterLink to="/chart">Create your own chart here!</RouterLink></p>
    </div>
    <p class="alert alert-info" v-else>
      <i class="bi bi-info-circle"></i> No charts found. Create the first one!
    </p>
  </template>
</template>
