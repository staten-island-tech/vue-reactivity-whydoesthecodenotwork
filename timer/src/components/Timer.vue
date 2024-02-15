<template>
    <div class="card" ref="cardElement" :style="{ left: posX + 'px', top: posY + 'px', zIndex: Timer.z }" @mousedown="emits('spotlight', Timer)">
        <div class="title">
            <h2 @input="editTextArea" @mousedown="startMove" @mousemove="extendLife">{{ title }}</h2>
            <button @click="die">x</button>
        </div>
        <textarea ref="textareaElement" @change="updateTitle"></textarea>
        <div class="timer">
            <output>{{ Timer.left }} / {{ Timer.length }}</output>
            <span class="barBackground"
                ><span
                    class="bar"
                    :style="{ width: (Timer.left * 100) / Timer.length + '%', backgroundColor: Timer.left > Timer.length ? 'rgb(0,255,0)' : 'rgb(255,255,0)' }"
                ></span
            ></span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
    Timer: "Object",
});

// explode: delete note, yeehaw: disable selecting (used when dragging)
const emits = defineEmits(["explode", "yeehaw", "spotlight"]);

// https://vuejs.org/guide/essentials/template-refs.html
const cardElement = ref(null);
const textareaElement = ref(null);

// vars that handle mouse dragging
let x = 0;
let y = 0;
const posX = ref();
const posY = ref();

// the title of the note
const title = ref("title");

function updateTitle(event) {
    const possibleTitle = event.target.value.split("\n")[0];
    title.value = possibleTitle.trim().length === 0 ? "note" : possibleTitle;
}

// both startmove and die call this. resume normal select behavior and stop dragging
function mouseUp() {
    console.log("BWUHH");
    emits("yeehaw", "stop");
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
}

// mouseUp calls this when removing
function mouseMove(event) {
    posX.value = event.pageX - x;
    posY.value = event.pageY - y;
    // damage the timer based on movement. this is very useful
    props.Timer.left -= Math.floor((Math.abs(event.movementX / window.innerWidth) + Math.abs(event.movementY / window.innerHeight)) * 100);
    if (props.Timer.left < 1) {
        die();
    }
}

function startMove(event) {
    emits("yeehaw", "go");
    x = event.offsetX;
    y = event.offsetY;
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
}

function extendLife(event) {
    if (event.buttons === 0) {
        // props.Timer.left++;
    }
}

function die(x) {
    mouseUp();
    console.log("oh BROTHER. this just exploded: " + title.value);
    emits("explode", props.Timer);
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

onMounted(() => {
    const timer = props.Timer;
    timer.left = timer.length;

    // overhealed timer will drain faster. can't change delay of settimeout so function that calls itself after delay it is
    let delay = 1000;
    async function tick() {
        delay = 1000;
        if (timer.left > timer.length) {
            delay = Math.max(1000 - (timer.left - timer.length) * 1, 1);
        }
        title.value = timer.z;
        timer.left--;
        if (timer.left < 1) {
            die();
            return;
        }
        await wait(delay);
        tick();
    }
    tick();
});
</script>

<style scoped>
.card {
    width: min-content;
    height: min-content;
    background-color: rgb(211, 211, 211);
    border: 2px solid rgb(0, 0, 0);
    border-radius: 5px;
    padding-bottom: 0.1rem;
    display: flex;
    flex-direction: column;
    position: absolute;
}

.card .title {
    display: flex;
    border-bottom: 2px solid rgb(0, 0, 0);
    cursor: move;
}

.card .title h2 {
    font-weight: normal;
    flex-grow: 1;
    margin: 0;
    margin-left: 0.25ch;
    margin-right: 0.5ch;
}

.card .title h2:focus,
.card .title button:focus,
.card textarea:focus {
    outline: none;
}

.card .title button {
    border: none;
    border-left: 1px solid;
    width: 1.5em;
}

.card textarea {
    width: 100%;
    border: none;
    border-bottom: 1px dotted rgb(0, 0, 0);
    min-width: 100px;
    width: 200px;
    min-height: 100px;
}

.card .timer {
    display: flex;
    gap: 1ch;
    justify-content: space-between;
    padding: 0 1ch;
    width: 100%;
    align-items: center;
}

.card .timer output {
    font-family: monospace;
    min-width: fit-content;
}

/* shoutout to the meter element for being not great */
.barBackground {
    width: 100%;
    flex-grow: 1;
    height: 0.5rem;
    background-color: rgb(0, 0, 0);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    padding: 1px;
}

.bar {
    height: 90%;
    /* background-color: rgb(255, 255, 0); */
    border-radius: 0.8rem;
}
</style>
