<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import { useI18n } from '../../../resources/js/composables/useI18n'
import { defineProps } from 'vue'
import Tournament from '#models/tournament'
import { Link } from '@inertiajs/vue3'
import TournamentCard from '~/components/TournamentCard.vue'

const { t } = useI18n()

defineProps({
  tournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  },
})
</script>

<template>
  <Layout>
    <div class="flex flex-col items-center justify-center py-8">
      <p class="text-4xl font-semibold">Les Tournois</p>
    </div>
    <div class="flex justify-between">
      <div>
        Ordre
      </div>
      <Link
        href="/new_tournament"
        class="bg-[#5C4741] hover:bg-[#7b5f57] text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        {{ t('home.showAllTournaments') }}
      </Link>
    </div>
   <div v-if="tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi n'est disponible pour le moment.
    </div>
    <div v-else class="mt-6 ml-6 grid gap-6 grid-cols-[repeat(auto-fit,minmax(350px,1fr))]">
    <TournamentCard class="my-6" v-for="tournament in tournaments" :key="tournament.id" :tournament="tournament" />
    </div>
  </Layout>

</template>

<style scoped>

</style>
