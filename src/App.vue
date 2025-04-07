<!-- "the template root requires exactly one element" YOU created the file with more than one element -->
<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
  // theme nonsense
  let theme = 'light' // default to light

  // local storage is used to override OS theme settings
  if (localStorage.getItem('theme')) {
    if (localStorage.getItem('theme') === 'dark') theme = 'dark'
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // OS theme setting detected as dark
    theme = 'dark'
  }

  if (theme === 'dark') document.body.classList.add('dark')
})
</script>

<style scoped></style>
