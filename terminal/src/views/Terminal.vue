<script setup>
import { onMounted } from "vue";

const input = defineModel();
let lastCommand = "";

onMounted(() => {
    document.getElementById("input").focus();
});

function refocus(event) {
    event.target.focus();
}

function command(a, event) {
    let sudo = false;
    event.target.value = "";

    let input = a.split(" ");
    if (input[0] === "sudo") {
        sudo = true;
        input.splice(0, 1);
    }
    input = input.map((arg) => {
        if (arg === "!!") {
            return lastCommand;
        }
        return arg;
    });

    a = input.join(" ");
    lastCommand = a;
    input = a.split(" ");

    switch (input[0]) {
        case "among":
            console.log("sus");
            break;
        default:
            console.log(`unknown command "${input[0]}"`);
            break;
    }
}
</script>

<template>
    <div id="wrapper">
        <div id="output"></div>
        <input type="text" name="input" id="input" v-model="input" @blur="refocus" @keydown.enter="command(input, $event)" placeholder="enter a command" />
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
