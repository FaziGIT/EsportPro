<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import logo from '../../img/logo.png'
</script>

<template>
  <div
    class="bg-[#779E7E] lg:w-[114px] h-full fixed left-0 top-0 flex-col items-center pt-3 shadow-md z-50 hidden lg:flex"
  >
    <div class="mb-10">
      <Link href="/">
        <img :src="logo" alt="Logo" class="w-20 h-20" />
      </Link>
    </div>
  </div>
</template>
