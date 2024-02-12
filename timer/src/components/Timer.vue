<template>
    <div>
        <input type="text" v-model="name" />
        <p>{{ Timer.left }} / {{ Timer.length }}</p>
        <meter min="0" :max="Timer.length" :value="Timer.left"></meter>
    </div>
</template>

<script setup>
import { onMounted, defineModel } from "vue";

const props = defineProps({
    Timer: "Object",
});

const emits = defineEmits(["explode"]);

const name = defineModel();

onMounted(() => {
    const timer = props.Timer;
    name.value = timer.name;
    timer.left = timer.length;
    const joe = setInterval(() => {
        timer.left--;
        if (timer.left < 1) {
            console.log("oh BROTHER. this just exploded: " + name.value);
            emits("explode", timer);
            clearInterval(joe);
        }
    }, 1000);
});
</script>

<style scoped></style>
