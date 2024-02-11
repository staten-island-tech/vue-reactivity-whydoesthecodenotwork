<template>
    <div>
        <h2>{{ Class.name }}</h2>
        <p>{{ Class.description }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    Class: "Object",
});
</script>

<style scoped></style>
