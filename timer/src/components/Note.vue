<template>
    <div
        class="card"
        ref="cardElement"
        :style="{ left: Note.x + 'px', top: Note.y + 'px', zIndex: Note.z }"
        @mousedown="emits('spotlight', Note)"
        :id="'id' + Note.z"
        titleElement
    >
        <div class="title" :style="{ cursor: cursor }">
            <h3
                @mousedown.exact="startMove"
                contenteditable="false"
                ref="titleElement"
                title="drag note to move, CONTROL CLICK to rename note"
                @input="changeWidth"
                autocomplete="off"
            >
                {{ title }}
            </h3>
            <button @click="die" title="delete note">x</button>
        </div>
        <div id="content">
            <div id="left">
                <textarea ref="textareaElement" @input="heat" @mousemove="changeWidth"></textarea>
                <output style="cursor: help" title="Notes will explode when overheated">Temperature: {{ Math.round((Note.temp / Note.max) * 100) }}%</output>
            </div>
            <div id="temp">
                <span class="barBackground">
                    <span
                        class="bar"
                        :style="{
                            height: (Note.temp * 100) / Note.max + '%',
                            backgroundColor: Note.temp > Note.max * 0.75 ? 'rgb(255,0,0)' : 'rgb(255,255,0)',
                        }"
                    ></span>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
    Note: "Object",
});

// explode: delete note, yeehaw: disable selecting (used when dragging)
const emits = defineEmits(["explode", "yeehaw", "spotlight"]);

// https://vuejs.org/guide/essentials/template-refs.html
const cardElement = ref(null);
const textareaElement = ref(null);
const titleElement = ref(null);
// the title of the note
const title = ref(null);

// vars that handle mouse dragging
let x = 0;
let y = 0;
const cursor = ref("grab");

// good enough
function changeWidth() {
    // console.log("ow");
    titleElement.value.style.maxWidth = `calc(${Math.max(200, textareaElement.value.getBoundingClientRect().width)}px + 0.5rem - 1.5em)`;
    // textareaElement.width = titleElement.value.style.maxWidth;
}

// both startmove and die call this. resume normal select behavior and stop dragging
function mouseUp() {
    // console.log("BWUHH");
    emits("yeehaw", "stop");
    cursor.value = "grab";
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
    if (titleElement.value) {
        titleElement.value.contentEditable = "plaintext-only";
    }
}

// mouseUp calls this when removing
function mouseMove(event) {
    props.Note.x = event.pageX - x;
    props.Note.y = event.pageY - y;
    // props.Note.temp -= Math.floor((Math.abs(event.movementX / window.innerWidth) + Math.abs(event.movementY / window.innerHeight)) * 100);
    if (props.Note.temp > 0) {
        props.Note.temp--;
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

function heat() {
    props.Note.temp += 5;
    if (props.Note.temp > props.Note.max) {
        die();
        return;
    }
}

function die(x) {
    mouseUp();
    // console.log("oh BROTHER. this just exploded: " + title.value);
    emits("explode", props.Note);
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

onMounted(() => {
    const note = props.Note;
    title.value = note.name;
    note.temp = 0;
    // hotter note will drain faster. can't change delay of settimeout so function that calls itself after delay it is
    let delay = 1000;
    async function tick() {
        delay = 500 + (note.max - note.temp) * 1;

        // title.value = delay;
        if (note.temp > 0) {
            note.temp--;
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
    display: flex;
    flex-direction: column;
    position: absolute;
}

.card .title {
    display: flex;
    border-bottom: 2px solid rgb(0, 0, 0);
}

.card .title h3 {
    font-weight: normal;
    flex-grow: 1;
    margin: 0;
    margin-left: 0.25ch;
    margin-right: 0.5ch;
    white-space: nowrap;
    overflow-x: hidden;
}

.card .title h3:focus,
.card .title button:focus,
.card textarea:focus {
    outline: none;
}

.card .title button {
    border: none;
    border-left: 1px solid;
    width: 1.5em;
}

.card #content {
    display: flex;
    justify-content: space-between;
    flex-grow: 1;
}

.card #content #left {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.card #content #left textarea {
    border: none;
    flex-grow: 1;
    border-bottom: 1px dotted rgb(0, 0, 0);
    min-width: 200px;
    width: 100%;
    min-height: 100px;
    resize: both;
}

.card #content #left output {
    font-family: monospace;
    min-width: fit-content;
    cursor: default;
    padding-left: 0.1rem;
    padding-bottom: 0.1rem;
}

/* shoutout to the meter element for being not great */
.card #content #temp .barBackground {
    height: 100%;
    width: 0.5rem;
    background-color: rgb(0, 0, 0);
    display: flex;
    align-items: end;
    justify-content: center;
    /* padding: 1px; */
    border-left: 1px solid rgb(0, 0, 0);
}

.card #content #temp .barBackground .bar {
    width: 90%;
    /* background-color: rgb(255, 255, 0); */
}
</style>
