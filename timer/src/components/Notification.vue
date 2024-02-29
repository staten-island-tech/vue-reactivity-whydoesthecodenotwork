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
    text-align: right;
    /* can't use % here because when its pos is absolute (transition when leaving) bad things happen */
    padding: 5px;
    width: max-content;
    height: max-content;
}
</style>
