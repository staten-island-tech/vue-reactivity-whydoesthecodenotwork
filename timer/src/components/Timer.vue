<template>
    <div
        class="card"
        ref="cardElement"
        :style="{ left: Timer.x + 'px', top: Timer.y + 'px', zIndex: Timer.z }"
        @mousedown="emits('spotlight', Timer)"
        :id="'id' + Timer.z"
    >
        <div class="title" :style="{ cursor: cursor }">
            <h2
                @mousedown.exact="startMove"
                @mousedown.shift="startEdit"
                contenteditable="true"
                ref="titleElement"
                title="drag note to move, CONTROL CLICK to rename note"
            >
                {{ title }}
            </h2>
            <button @click="die" title="delete note">x</button>
        </div>
        <textarea ref="textareaElement" @input="heal"></textarea>
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
const titleElement = ref(null);
// the title of the note
const title = ref("title");

// vars that handle mouse dragging
let x = 0;
let y = 0;
const cursor = ref("grab");

function startEdit() {
    const element = titleElement.value;
    console.log("yippe");
    cursor.value = "text";
    // element.contentEditable = "true";
    element.focus();
    element.addEventListener("blur", endEdit);
}

function endEdit() {
    const element = titleElement.value;
    console.log("boohoo");
    cursor.value = "grab";
    // element.contentEditable = "false";
    element.removeEventListener("blur", endEdit);
}

// both startmove and die call this. resume normal select behavior and stop dragging
function mouseUp() {
    console.log("BWUHH");
    emits("yeehaw", "stop");
    cursor.value = "grab";
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
    if (titleElement.value) {
        titleElement.value.contentEditable = "true";
    }
}

// mouseUp calls this when removing
function mouseMove(event) {
    props.Timer.x = event.pageX - x;
    props.Timer.y = event.pageY - y;
    // // damage the timer based on movement. this is very useful
    // props.Timer.left -= Math.floor((Math.abs(event.movementX / window.innerWidth) + Math.abs(event.movementY / window.innerHeight)) * 100);
    props.Timer.left--;
    if (props.Timer.left < 1) {
        die();
    }
}

function startMove(event) {
    // we are currently editing the title. do not drag
    if (cursor.value === "text") {
        return;
    }
    titleElement.value.contentEditable = "false";
    emits("yeehaw", "go");
    x = event.offsetX;
    y = event.offsetY;
    cursor.value = "grabbing";
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
}

function heal() {
    props.Timer.left++;
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
        // title.value = timer.z;
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

window.addEventListener("keydown", (event) => {
    if (event.key === "Control" && cursor.value !== "grabbing") {
        cursor.value = "text";
    }
});
window.addEventListener("keyup", (event) => {
    if (event.key === "Control" && cursor.value !== "grabbing") {
        cursor.value = "grab";
    }
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
}

.card .title h2 {
    font-weight: normal;
    flex-grow: 1;
    margin: 0;
    margin-left: 0.25ch;
    margin-right: 0.5ch;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
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
    cursor: default;
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
