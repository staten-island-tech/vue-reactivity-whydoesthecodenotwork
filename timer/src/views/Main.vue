<script setup>
import Note from "../components/Note.vue";
import { storeToRefs } from "pinia";
import { useNotes } from "@/stores/notes.js";
import { ref, onMounted } from "vue";

const pos = ref();

const notes = useNotes();
const { noteList, helpfulLength } = storeToRefs(notes);

function explode(note) {
    // because explosions change index so you can't just save an index inside note object and be done with it
    noteList.value.splice(noteList.value.indexOf(note), 1);
    notes.updateZ();
}

// don't let user select text while dragging a note
const canSelect = ref("initial");
function toggleSelect(x) {
    canSelect.value = x === "go" ? "none" : "initial";
    // console.log(canSelect.value);
}

function arrange() {
    noteList.value.forEach((note) => {
        const element = document.querySelector(`.card#id${note.z}`);
        element.style.position = "static";
    });
    noteList.value.forEach((note) => {
        const element = document.querySelector(`.card#id${note.z}`);
        const pos = element.getBoundingClientRect();
        note.x = pos.x;
        note.y = pos.y;
    });
    Array.from(document.querySelectorAll(".card")).forEach((element) => {
        const note = noteList.value[element.id.slice(2)];
        element.style.position = "absolute";
        element.style.left = note.x;
        element.style.top = note.y;
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

function save() {
    if (storageAvailable("localStorage")) {
        localStorage.setItem("notes", JSON.stringify(noteList.value));
    }
}

function load() {
    if (storageAvailable("localStorage")) {
        if (localStorage.getItem("notes")) {
            // load saved notes
            const loadNotes = Array.from(JSON.parse(localStorage.getItem("notes")));
            notes.set(loadNotes);
        }
    }
}

function clear() {
    if (window.confirm("do you REALLY want to clear all your notes?")) {
        notes.set([]);
    }
}

onMounted(() => {
    load();
    // for mobile, automatically disable note dragging (because it doesn't work on mobile)
    if (navigator.maxTouchPoints > 1) {
        pos.value = true;
    }
});
</script>

<template>
    <div :style="{ userSelect: canSelect, webkitUserSelect: canSelect }">
        <header id="main">
            <h1>the noteinator</h1>
            <div v-if="helpfulLength > 0">
                <h2>you have {{ helpfulLength }} note{{ helpfulLength > 1 ? "s" : "" }}</h2>
            </div>
            <h2 v-else>you have NO notes...</h2>
            <div id="inputs">
                <button @click="notes.addNote(`note #${helpfulLength + 1}`, 300)">create a note</button>
                <button @click="arrange">arrange notes</button>
                <button @click="save">save notes</button>
                <button @click="load">load notes</button>
                <button @click="clear">clear notes</button>
                <label>list notes?<input type="checkbox" v-model="pos" /></label>
            </div>
            <a
                href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
                target="_blank"
                rel="noopener noreferrer"
                >markdown guide (github flavored markdown)</a
            >
        </header>
        <div id="notes">
            <Note
                v-for="note in noteList"
                :key="note"
                :Note="note"
                @explode="explode"
                @yeehaw="toggleSelect"
                :Position="pos ? 'static' : 'absolute'"
                @spotlight="notes.spotlight"
            />
        </div>
    </div>
</template>

<style></style>
<style scoped>
#main {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffffdd;
    border-bottom: 2px solid black;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

h1,
h2 {
    margin: auto 0;
}

h1 {
    text-decoration: underline;
}

#notes {
    display: flex;
    flex-wrap: wrap;
    align-self: stretch;
}

#inputs {
    display: flex;
    gap: 1rem;
}
</style>
