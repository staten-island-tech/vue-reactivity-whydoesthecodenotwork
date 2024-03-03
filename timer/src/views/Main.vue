<script setup>
import Note from "../components/Note.vue";
import Notification from "../components/Notification.vue";
import { storeToRefs } from "pinia";
import { useNotes } from "@/stores/notes.js";
import { ref, onMounted } from "vue";

// if this is true, notes dragging will be disabled
const pos = ref(false);

const notes = useNotes();
const { noteList, helpfulLength } = storeToRefs(notes);

const notifications = ref([]);

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

function addNotification(msg) {
    // make a "unique" key
    notifications.value.push([msg, `${Date.now()};${notifications.value.length}`]);
    if (notifications.value.length % 10 === 0) {
        notifications.value.push(["Slow down!!!!", `${Date.now()};${notifications.value.length}`]);
        clearNotification();
    }
    clearNotification();
}

function clearNotification() {
    setTimeout(() => {
        notifications.value.splice(0, 1);
    }, 5000);
}

function save() {
    if (!storageAvailable("localStorage")) {
        addNotification(`❌ your browser does NOT support saving notes :(`);
        return;
    }
    try {
        localStorage.setItem("notes", JSON.stringify(noteList.value));
        addNotification(`saved ${noteList.value.length} note${noteList.value.length === 1 ? "" : "s"}`);
    } catch {
        addNotification(`❌ save failed (size limit exceeded?)`);
    }
}

function load() {
    if (!storageAvailable("localStorage")) {
        addNotification(`❌ your browser does NOT support saving notes :(`);
        return;
    }
    if (!localStorage.getItem("notes")) {
        addNotification(`no saved notes found!`);
        return;
    }
    // load saved notes
    const loadNotes = Array.from(JSON.parse(localStorage.getItem("notes")));

    const defaultNote = { name: "a note", max: 300, z: 0, x: 0, y: 0, focus: false, content: "", temp: 0, width: 200, height: 100 };
    loadNotes.forEach((note) => {
        // set any missing properties
        for (const [key, value] of Object.entries(defaultNote)) {
            note[key] ??= value;
        }
        // remove any excess properties
        const keys = Object.keys(note);
        const defaultKeys = Object.keys(defaultNote);
        if (keys.length !== defaultKeys.length) {
            console.log("BLAU");
            keys.forEach((key) => {
                if (!Object.keys(defaultNote).includes(key)) {
                    delete note[key];
                }
            });
        }
    });
    notes.set(loadNotes);
    addNotification(`loaded ${loadNotes.length} note${loadNotes.length === 1 ? "" : "s"}`);
}

function clear() {
    if (window.confirm("do you REALLY want to clear all your notes?")) {
        notes.set([]);
        addNotification(`cleared notes`);
    }
}

// MISLEADING: there is only 1 setting
function saveSettings() {
    try {
        localStorage.setItem("display", pos.value);
    } catch {
        console.log("you seriously don't have enough space to store a checkbox setting????");
    }
}

onMounted(() => {
    load();
    // load display setting
    // for mobile, automatically disable note dragging (because it doesn't work on mobile)
    const display = localStorage.getItem("display");
    pos.value = display ? display === "true" : navigator.maxTouchPoints > 1;
    saveSettings();
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
                <label>list notes? (touchscreen friendly)<input type="checkbox" v-model="pos" @change="saveSettings" /></label>
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
        <div id="notifications">
            <TransitionGroup name="notifications">
                <Notification v-for="notification in notifications" :Message="notification[0]" :key="notification[1]"></Notification>
            </TransitionGroup>
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
    font-family: cursive;
    text-align: center;
    margin: 0 0.1rem;
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
    justify-content: space-around;
    gap: 1ch;
    margin: 0.5rem 0;
}

#notifications {
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 0.5rem;
}

.notifications-item {
    position: static;
    display: block;
}

.notifications-move,
.notifications-enter-active,
.notifications-leave-active {
    transition: 0.2s ease-out;
    transition-property: transform, opacity, top;
}

.notifications-enter-from,
.notifications-leave-to {
    transform: translateX(10px);
    opacity: 0;
}
</style>
