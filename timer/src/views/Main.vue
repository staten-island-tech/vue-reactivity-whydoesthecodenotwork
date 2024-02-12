<script setup>
import { storeToRefs } from "pinia";
import { useTimers } from "@/stores/timers.js";
import Timer from "../components/Timer.vue";
import { ref } from "vue";

const timers = useTimers();
const { timerList, unhelpfulLength } = storeToRefs(timers);

function explode(Timer) {
    console.log("wow");
    timerList.value.splice(timerList.value.indexOf(Timer), 1);
}
</script>

<template>
    <main>
        <div id="timers" v-if="unhelpfulLength > 0">
            <h1>you have (0.5*{{ unhelpfulLength }}) timers:</h1>
            <!-- student uses ENTIRE OBJECT as key, asked to leave APCSP -->
            <Timer v-for="Timer in timerList" :key="Timer" :Timer="Timer" @explode="explode" />
        </div>
        <h1 v-else>you have NO timers...</h1>
        <button @click="timers.addTimer('this is name', 5)">oh man</button>
    </main>
</template>
