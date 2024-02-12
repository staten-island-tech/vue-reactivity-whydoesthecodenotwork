<template>
    <div>
        <h2>{{ Timer.name }}</h2>
        <p>{{ Timer.left }} / {{ Timer.length }}</p>
    </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
    Timer: "Object",
});

onMounted(() => {
    const timer = props.Timer;
    timer.left = timer.length;
    const joe = setInterval(() => {
        timer.left--;
        console.log("IAIWNEOWNJO");
        if (timer.left < 1) {
            clearInterval(joe);
        }
    }, 1000);
});
</script>

<style scoped></style>
