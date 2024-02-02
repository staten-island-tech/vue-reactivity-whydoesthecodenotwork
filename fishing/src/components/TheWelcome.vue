<template>
  <div>
    <h1 v-if="bool">hooray</h1>
    <h1 v-else>booray</h1>
    <ul>
      <li v-for="animal in animals">holy hell, is that {{ animal }}</li>
    </ul>
  </div>
</template>

<script setup>
const bool = true
const animals = ["joe", "not joe", "evil joe"]
</script>

<style lang="css" scoped>
h1 {
  text-decoration: underline;
  text-transform: uppercase;
}

li::before {
  content: "💀";
  margin-right: 1ch;
}

li {
  text-shadow: 0 0 5px red;
}
</style>