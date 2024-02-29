<template>
    <output>{{ Message }}</output>
</template>

<script setup>
const props = defineProps({
    Message: String,
});
</script>

<style scoped>
output {
    border: solid black 2px;
    background-color: #fff;
    width: max-content;
    /* width: -moz-fit-content; */
    text-align: right;
    padding: 5%;
}
</style>
