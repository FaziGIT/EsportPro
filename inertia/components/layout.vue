<script setup lang="ts">
import Navbar from './navbar.vue'
import Sidebar from './sidebar.vue'
import Footer from './footer.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Sidebar />

    <div class="lg:ml-[114px] flex flex-col min-h-screen">
      <Navbar />

      <main class="flex-1 p-6">
        <slot></slot>
      </main>

      <Footer />
    </div>
  </div>
</template>
