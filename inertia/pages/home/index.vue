<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layouts/layout.vue'
import TournamentCard from '~/components/TournamentCard.vue'
import mockTournament from '~/mocks/mockTournament'

const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
})
</script>

<template>
  <Layout>
    <p>{{ props.title }}</p>
    <p>{{ props.description }}</p>
    <TournamentCard :tournament="mockTournament"></TournamentCard>
  </Layout>
</template>
