<template>
  <span>{{ message }}</span>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style scoped>
span {
  border: solid black 2px;
  background-color: #fff;
  text-align: right;
  padding: 5%;
  width: max-content;
  height: max-content;
  z-index: 9999;
}

body.dark span {
  border-color: white;
  background-color: #000;
}
</style>
