<template>
    <div>
        <h2>{{ props.note.name }}</h2>
        <p>{{ props.note.content }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    note: "Object",
});
</script>

<style scoped>
* {
    color: white;
}
body {
    background-color: white;
}
</style>
