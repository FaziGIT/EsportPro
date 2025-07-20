<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import { useI18n } from '../../../resources/js/composables/useI18n'

const { t } = useI18n()

</script>
<template>
  <Layout>
    <div class="text-center py-20">
      <h1 class="text-4xl font-bold text-red-600">{{ t('common.unauthorized') }}</h1>
      <p class="text-lg mt-4">{{ t('common.youAreBanned') }}</p>
    </div>
  </Layout>
</template>
