<template>
    <div
        class="card"
        ref="cardElement"
        :class="Note.focus ? 'active' : ''"
        :style="{ left: Note.x + 'px', top: Note.y + 'px', zIndex: Note.z }"
        @mousedown="emits('spotlight', Note)"
        :id="'id' + Note.z"
    >
        <div class="title" :style="{ cursor: cursor }">
            <h3
                @mousedown.exact="startMove"
                @input="heat"
                contenteditable="false"
                ref="titleElement"
                title="DRAG titlebar to move, CONTROL CLICK to rename note"
                autocomplete="off"
            >
                {{ title }}
            </h3>
            <button @click="die" title="delete note">x</button>
        </div>
        <div id="content">
            <div id="left">
                <textarea ref="textareaElement" @input="heat" @blur="endEdit" title="use markdown formatting"></textarea>
                <div id="output" ref="mdElement" @dblclick="startEdit" title="DOUBLE CLICK to edit"></div>
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
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
// "i absolve you of your sins. you have been forgiven"
import DOMPurify from "dompurify";

const props = defineProps({
    Note: "Object",
});

// explode: delete note, yeehaw: disable selecting (used when dragging)
const emits = defineEmits(["explode", "yeehaw", "spotlight"]);

// https://vuejs.org/guide/essentials/template-refs.html
const cardElement = ref(null);
const titleElement = ref(null);
const textareaElement = ref(null);
const mdElement = ref(null);
// the title of the note
const title = ref(null);

// vars that handle mouse dragging
let x = 0;
let y = 0;
const cursor = ref("grab");

// good enough
function changeWidth() {
    // console.log("ow");
    if (titleElement.value) {
        titleElement.value.style.maxWidth = `calc(${Math.max(200, textareaElement.value.getBoundingClientRect().width)}px + 0.5rem - 1ch - 22px)`;
    }
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
        // shoutout to firefox for just Not Supporting plaintext-only
        titleElement.value.contentEditable = "true";
    }
}

// mouseUp calls this when removing
function mouseMove(event) {
    // These numbers came to me in a dream
    props.Note.x = event.pageX - x - 4;
    props.Note.y = event.pageY - y - 2;
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

// user is now editing the textarea. stop displaying markdown
function startEdit() {
    const mdSize = mdElement.value.getBoundingClientRect();
    mdElement.value.style.display = "none";
    textareaElement.value.style.width = mdSize.width + "px";
    textareaElement.value.style.height = mdSize.height + "px";
    textareaElement.value.style.display = "flex";
    textareaElement.value.focus();
}

function endEdit() {
    const textareaSize = textareaElement.value.getBoundingClientRect();
    textareaElement.value.style.display = "none";
    mdElement.value.innerHTML = DOMPurify.sanitize(marked.parse(textareaElement.value.value));
    mdElement.value.style.width = textareaSize.width + "px";
    mdElement.value.style.height = textareaSize.height + "px";
    mdElement.value.style.display = "block";
}

function heat() {
    props.Note.temp += 5;
    if (props.Note.temp > props.Note.max) {
        die();
        return;
    }
}

function die() {
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
    emits("spotlight", note);
    title.value = note.name;
    new ResizeObserver(changeWidth).observe(textareaElement.value);
    note.temp = 0;
    // hotter note will drain faster. can't change delay of settimeout so function that calls itself after delay it is
    let delay = 1000;
    async function tick() {
        delay = 200 + (note.max - note.temp) * 2;

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
window.addEventListener("focus", () => {
    cursor.value = "grab";
});
</script>

<style scoped>
.card {
    width: min-content;
    height: min-content;
    background-color: rgb(211, 211, 211);
    border: 2px solid rgb(0, 0, 0);
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: absolute;
}

.card.active {
    /* IS THAT THE GRIM REAPER??? */
    box-shadow: 0 0 5px #666666;
}

.card .title {
    display: flex;
    border-bottom: 2px solid rgb(0, 0, 0);
    gap: 0.5ch;
    background-image: linear-gradient(90deg, #b4b4b4, #dddddd);
    justify-content: space-between;
}

.card .title h3 {
    font-weight: normal;
    flex-grow: 1;
    margin: 0;
    margin-left: 0.25ch;
    /* margin-right: 0.5ch; */
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
    width: 1ch;
    box-sizing: content-box;
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
    display: none;
    border: none;
    flex-grow: 1;
    border-bottom: 1px dotted rgb(0, 0, 0);
    min-width: 200px;
    min-height: 100px;
    resize: both;
}

/* markdown output */
.card #content #left #output {
    display: block;
    border: none;
    flex-grow: 1;
    border-bottom: 1px dotted rgb(0, 0, 0);
    /* cuts your hex code in half */
    background: #fff;
    min-width: 200px;
    min-height: 100px;
    overflow-y: scroll;
    resize: both;
}

/* temperature % */
.card #content #left output {
    font-family: monospace;
    min-width: fit-content;
    min-width: -moz-fit-content;
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
