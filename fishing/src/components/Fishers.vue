<script setup>
const props = defineProps({
    fishers: {
        type: Array,
        required: true,
    },
});
import FisherCard from "./FisherCard.vue";
</script>

<template>
    <div>
        <h2>fishers</h2>
        <div id="fishers">
            <FisherCard v-for="fisher in props.fishers" :key="fisher.name" :fisher="fisher"></FisherCard>
        </div>
    </div>
</template>

<style scoped></style>
