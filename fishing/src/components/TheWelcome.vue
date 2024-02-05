<template>
    <div>
        <h1 v-if="bool">hooray</h1>
        <h1 v-else>booray</h1>
        <ul>
            <li v-for="(character, index) in character" :key="character.name">
                holy hell, is that {{ character.name }} with net worth of ${{ character.money }} index number {{ index }}
            </li>
        </ul>
        <button @click="scream">press me</button>
    </div>
</template>

<script setup>
const bool = true;
function scream() {
    alert("STOPPP");
}
const props = defineProps(["character"]);
</script>

<style lang="css" scoped>
h1 {
    text-decoration: underline;
    text-transform: uppercase;
}

li::before {
    content: "💀";
    margin-right: 1ch;
}

li {
    text-shadow: 0 0 5px red;
}
</style>
