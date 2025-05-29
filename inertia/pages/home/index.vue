<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import TournamentCard from '~/components/TournamentCard.vue'
import Tournament from '#models/tournament'

const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  tournaments: {
    type: Array as () => Tournament[],
    default: () => [],
  }
})
</script>

<template>
  <Layout>
    <p>{{ props.title }}</p>
    <p>{{ props.description }}</p>

    <div v-if="tournaments.length === 0" class="text-center py-8 text-gray-500">
      Aucun tournoi n'est disponible pour le moment.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <TournamentCard v-for="tournament in tournaments" :key="tournament.id" :tournament="tournament" />
    </div>
  </Layout>
</template>
