<script setup lang="ts">
import Layout from '~/components/layouts/layout.vue'
import GeneralInfoUser from '~/components/profile/GeneralInfoUser.vue'
import { defineProps } from 'vue'
import User from '#models/user'

const props = defineProps<{
  user: User
}>()

</script>
<template>
  <Layout class="bg-[#fafafa]">
    <p class="text-4xl font-semibold">Mon profil</p>
    <GeneralInfoUser :user="user"/>
  </Layout>
</template>
