<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfo from '~/components/profile/generalInfo.vue'
import { defineProps, ref } from 'vue'
import User from '#models/user'

const props = defineProps<{
  user: User
}>()

</script>
<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>
    <GeneralInfo :user="user"/>
  </Layout>
</template>
