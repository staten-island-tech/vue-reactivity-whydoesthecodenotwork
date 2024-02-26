<script setup>
import Note from "../components/Note.vue";
import { storeToRefs } from "pinia";
import { useNotes } from "@/stores/notes.js";
import { ref } from "vue";

const notes = useNotes();
const { noteList, helpfulLength } = storeToRefs(notes);

function explode(Note) {
    // because explosions change index so you can't just save an index inside note object and be done with it
    noteList.value.splice(noteList.value.indexOf(Note), 1);
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
        const pos = element.getBoundingClientRect();
        note.x = pos.x;
        note.y = pos.y;
        console.log(note);
    });
    Array.from(document.querySelectorAll(".card")).forEach((element) => {
        const note = noteList.value[element.id.slice(2)];
        console.log(note);
        element.style.position = "absolute";
        element.style.left = note.x;
        element.style.top = note.y;
    });
}
</script>

<template>
    <div :style="{ userSelect: canSelect, webkitUserSelect: canSelect }">
        <h1>the noteinator</h1>
        <div v-if="helpfulLength > 0">
            <h2>you have {{ helpfulLength }} note{{ helpfulLength > 1 ? "s" : "" }}:</h2>
            <div id="notes">
                <Note v-for="Note in noteList" :key="Note" :Note="Note" @explode="explode" @yeehaw="toggleSelect" @spotlight="notes.spotlight" />
            </div>
        </div>
        <h2 v-else>you have NO notes...</h2>
        <button @click="notes.addNote(`note #${helpfulLength + 1}`, 300)">create a note</button>
        <button @click="arrange">arrange notes</button>
    </div>
</template>

<style></style>
<style scoped>
h1 {
    text-decoration: underline;
}
#notes {
    display: flex;
    flex-wrap: wrap;
}
</style>
