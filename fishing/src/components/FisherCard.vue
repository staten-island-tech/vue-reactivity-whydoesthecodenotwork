<script setup>
defineProps({
    fisher: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div>
        <p>it's {{ fisher.name }}</p>
    </div>
</template>

<style scoped></style>
