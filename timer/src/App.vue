<script setup>
import { RouterView } from "vue-router";
</script>

<!-- "the template root requires exactly one element" YOU created the file with more than one element -->
<template>
    <RouterView />
</template>

<style>
body {
    background: radial-gradient(circle at center, #000000 0px, transparent 3px);
    background-size: 75px 75px;
}
</style>

<style scoped></style>
