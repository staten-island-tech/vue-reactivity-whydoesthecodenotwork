<script setup>
import { RouterLink, RouterView } from "vue-router";
import Fishers from "./components/Fishers.vue";
const fishers = [{ name: "joe" }, { name: "steve" }];
</script>

<template>
    <header>
        <h1>i poisoned the water supply. now everyone dead.<small>oops</small></h1>
        <Fishers :fishers="fishers"></Fishers>
        <!-- <RouterLink to="/about">About</RouterLink> -->
        <!-- <RouterLink to="/">Home</RouterLink> -->
    </header>
</template>

<style scoped></style>
