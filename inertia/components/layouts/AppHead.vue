<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref, onMounted } from 'vue'

defineProps({
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
</script>

<template>
  <Head>
    <title>{{ title }}</title>
    <meta name="description" :content="description" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" :content="title" />
    <meta property="og:description" :content="description" />
    <meta property="og:image" v-if="image" :content="image" />
    <meta property="og:url" v-if="currentUrl" :content="currentUrl" />

    <!-- Twitter Card -->
    <meta name="twitter:card" :content="image ? 'summary_large_image' : 'summary'" />
    <meta name="twitter:title" :content="title" />
    <meta name="twitter:description" :content="description" />
    <meta name="twitter:image" v-if="image" :content="image" />
  </Head>
</template>
