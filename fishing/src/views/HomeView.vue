<script setup>
import { storeToRefs } from "pinia";
import { useCounterStore } from "@/stores/counter.js";
const counterStore = useCounterStore();
const { count } = storeToRefs(counterStore);
console.log(count);
import TheWelcome from "../components/TheWelcome.vue";
</script>

<template>
    <main>
        <TheWelcome v-for="character in count" :key="character.name" :character="character" />
    </main>
</template>
