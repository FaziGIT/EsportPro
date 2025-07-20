<script setup lang="ts">
defineProps({
  width: {
    type: [Number, String],
    default: 20
  },
  height: {
    type: [Number, String],
    default: 20
  },
  color: {
    type: String,
    default: "#f50000"
  }
})
</script>
<template>
  <svg :height="height" :width="width" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 329.097 329.097" xml:space="preserve" fill="#000000" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path :fill="color" d="M127.631,94.936l-17.93-17.93l76.991-77.002l17.936,17.93l-6.331,6.331l-64.341,64.341 L127.631,94.936z M172.991,127.628l28.474,28.48L28.48,329.094L0,300.62L172.991,127.628z M218.346,156.114l-45.36-45.36 l-22.155-22.149l47.466-47.466l89.658,89.658l-47.466,47.472L218.346,156.114z M252.094,219.399l-17.936-17.93l6.337-6.331 l64.341-64.347l6.337-6.325l17.924,17.93L252.094,219.399z"></path> </g> </g></svg>
</template>

