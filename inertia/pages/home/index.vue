<script setup lang="ts">
import { defineProps } from 'vue'
import Layout from '~/components/layout.vue'

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
  </Layout>
</template>
