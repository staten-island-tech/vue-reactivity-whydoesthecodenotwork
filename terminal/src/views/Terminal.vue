<script setup>
import { onMounted, ref } from "vue";
import note from "../components/note.vue";

let lastCommand = "";
const input = defineModel();
const notes = ref({});

onMounted(() => {
    document.getElementById("input").focus();
});

function command(a) {
    let sudo = false;

    let input = a;
    input = input.replace("!!", lastCommand);

    if (input.startsWith("sudo")) {
        sudo = true;
    }

    input = input.replace("sudo", "");
    input = input.replace(/(\s+)/g, " ");
    input = input.trim();

    lastCommand = input;
    input = input.split(" ");
    let error = "";
    switch (input[0]) {
        case "makenote":
            // number of args
            if (input.length - 1 !== 2) {
                error = `bad number of arguments supplied (expected 2, got ${input.length - 1})`;
                break;
            }
            if (notes.value[input[1]]) {
                error = `a note with name ${input[1]} already exists`;
                break;
            }
            notes.value[input[1]] = { name: input[1], content: input[2] };
            break;
        case "among":
            console.log("sus");
            break;
        default:
            error = `unknown command "${input[0]}"`;
            break;
    }
    if (error) {
        console.log(error);
    }
    input = "";
}
</script>

<template>
    <div id="wrapper">
        <div id="notes">
            <note v-for="note in notes" :key="note.name" :note="note"></note>
        </div>
        <input type="text" name="input" id="input" v-model.trim="input" @keydown.enter="command(input)" placeholder="enter a command" />
    </div>
</template>

<style scoped>
h1 {
    color: white;
}
#wrapper {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
}
input {
    color: white;
    background: black;
    border: none;
    border-top: 1px solid white;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
}
</style>
