<script setup lang="ts">
import Navbar from './navbar.vue'
import Sidebar from './sidebar.vue'
import Footer from './footer.vue'
import Chat from '~/components/layouts/chat.vue'
import { useAuth } from '../../../resources/js/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Sidebar />

    <div class="lg:ml-[114px] flex flex-col min-h-screen">
      <Navbar />

      <main class="flex-1 p-6 bg-[#F3F3F4]">
        <slot></slot>
      </main>

      <!-- Show the chat only if the user is login -->
      <div v-if="user">
        <Chat />
      </div>

      <Footer />
    </div>
  </div>
</template>
