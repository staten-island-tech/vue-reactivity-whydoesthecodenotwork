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
    // console.log(canSelect.value);
}

function arrange() {
    timerList.value.forEach((timer) => {
        const element = document.querySelector(`.card#id${timer.z}`);
        element.style.position = "static";
        const pos = element.getBoundingClientRect();
        timer.x = pos.x;
        timer.y = pos.y;
        console.log(timer);
    });
    Array.from(document.querySelectorAll(".card")).forEach((element) => {
        const timer = timerList.value[element.id.slice(2)];
        console.log(timer);
        element.style.position = "absolute";
        element.style.left = timer.x;
        element.style.top = timer.y;
    });
}
</script>

<template>
    <div :style="{ userSelect: canSelect, webkitUserSelect: canSelect }">
        <div v-if="unhelpfulLength > 0">
            <h1>you have (0.25*{{ unhelpfulLength }}) timers:</h1>
            <div id="timers">
                <Timer v-for="Timer in timerList" :key="Timer" :Timer="Timer" @explode="explode" @yeehaw="toggleSelect" @spotlight="timers.spotlight" />
            </div>
        </div>
        <h1 v-else>you have NO timers...</h1>
        <button @click="timers.addTimer('this is name', 300)">oh man</button>
        <button @click="arrange">arrange timers</button>
    </div>
</template>

<style></style>
<style scoped>
#timers {
    display: flex;
    flex-wrap: wrap;
}
</style>
