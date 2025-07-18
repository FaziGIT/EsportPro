<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default: null,
  }
})

const currentUrl = ref('')

onMounted(() => {
  currentUrl.value = window.location.href
})

const imageToUse = computed(() => {
  return props.image || 'https://esportpro.cloud/og/home.png'
})
</script>

<template>
  <Head>
    <title>{{ title }}</title>
    <meta name="description" :content="description" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" :content="title" />
    <meta property="og:description" :content="description" />
    <meta property="og:image" :content="imageToUse" />
    <meta property="og:url" v-if="currentUrl" :content="currentUrl" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" :content="title" />
    <meta name="twitter:description" :content="description" />
    <meta name="twitter:image" :content="imageToUse" />
  </Head>
</template>
