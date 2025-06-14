<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import { ref, onMounted } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import { useI18n } from '../../../resources/js/composables/useI18n'
import Tournament from '#models/tournament'
import { Link } from '@inertiajs/vue3'
import TournamentCard from '~/components/TournamentCard.vue'

const { t } = useI18n()

const tournaments = ref<Tournament[]>([])
const page = ref(1)
const loading = ref(false)
const allLoaded = ref(false)

const container = ref<HTMLElement | null>(null)

const loadTournaments = async () => {
  if (loading.value || allLoaded.value) return
  loading.value = true

  try {
    const res = await fetch(`/api/tournaments?page=${page.value}&limit=20`)
    const data: Tournament[] = await res.json()

    if (data.length === 0) {
      allLoaded.value = true
    } else {
      tournaments.value.push(...data)
      page.value++
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(loadTournaments)

useInfiniteScroll(
  () => window,
  loadTournaments,
  {
    distance: 100,
    canLoadMore: () => !loading.value && !allLoaded.value,
  }
)

</script>

<template>
  <Layout>
    <div class="text-4xl font-semibold text-center py-6">Les Tournois</div>

    <div class="px-6 mb-4 flex justify-between">
      <div>Ordre</div>
      <Link
        href="/new_tournament"
        class="bg-[#5C4741] hover:bg-[#7b5f57] text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        {{ t('home.showAllTournaments') }}
      </Link>
    </div>

    <!-- InfiniteScroll container -->
    <div
      ref="container"
      class="h-[calc(100vh-200px)] overflow-y-auto px-6">
      <div class="grid gap-6 grid-cols-[repeat(auto-fit,minmax(350px,1fr))]">
        <TournamentCard
          class="my-6"
          v-for="tournament in tournaments"
          :key="tournament.id"
          :tournament="tournament"
        />
      </div>

      <div v-if="loading" class="text-center py-6 text-gray-500">Chargement...</div>
      <div v-if="allLoaded" class="text-center py-6 text-gray-400">Tous les tournois sont chargés.</div>
    </div>
  </Layout>
</template>

<style scoped>

</style>
