<script setup>
import { RouterView } from "vue-router";
</script>

<!-- "the template root requires exactly one element" YOU created the file with more than one element -->
<template>
    <RouterView />
</template>

<style>
body {
    /* background: radial-gradient(circle at 1px 1px, #000000 1px, transparent 0), radial-gradient(circle at 1px 1px, #000000 1px, transparent 0);
    background-size: 80px 80px;
    background-position: 0px 0px, 40px 40px; */
    background: radial-gradient(circle at center, #000000 2px, transparent 0);
    background-size: 80px 80px;
    background-position: 0px 0px;
}
</style>

<style scoped></style>
