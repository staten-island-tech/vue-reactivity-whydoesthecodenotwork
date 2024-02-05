<script setup>
import TheWelcome from "../components/TheWelcome.vue";
const joe = [
    {
        name: "mario",
        money: 500,
    },
    {
        name: "luigi",
        money: 5000,
    },
    {
        name: "wario",
        money: -500000,
    },
    {
        name: "waluigi",
        money: 0,
    },
];
</script>

<template>
    <main>
        <TheWelcome v-for="character in joe" :key="character.name" :item="character" />
    </main>
</template>
