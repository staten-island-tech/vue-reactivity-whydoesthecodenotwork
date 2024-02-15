<script setup>
import { storeToRefs } from "pinia";
import { useTimers } from "@/stores/timers.js";
import Timer from "../components/Timer.vue";
import { ref } from "vue";

const timers = useTimers();
const { timerList, unhelpfulLength } = storeToRefs(timers);

function explode(Timer) {
    // because explosions change index so you can't just save an index inside timer object and be done with it
    timerList.value.splice(timerList.value.indexOf(Timer), 1);
    timers.updateZ();
}

const canSelect = ref("initial");
function toggleSelect(x) {
    canSelect.value = x === "go" ? "none" : "initial";
    console.log(canSelect.value);
}
</script>

<template>
    <div :style="{ userSelect: canSelect, webkitUserSelect: canSelect }">
        <div id="timers" v-if="unhelpfulLength > 0">
            <h1>you have (0.5*{{ unhelpfulLength }}) timers:</h1>
            <!-- student uses ENTIRE OBJECT as key, asked to leave APCSP -->
            <Timer v-for="Timer in timerList" :key="Timer" :Timer="Timer" @explode="explode" @yeehaw="toggleSelect" @spotlight="timers.spotlight" />
        </div>
        <h1 v-else>you have NO timers...</h1>
        <button @click="timers.addTimer('this is name', 300)">oh man</button>
    </div>
</template>

<style scoped></style>
