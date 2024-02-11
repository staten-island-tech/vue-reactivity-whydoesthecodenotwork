<script setup>
import { storeToRefs } from "pinia";
import { useClasses } from "@/stores/classes.js";
import Class from "../components/Class.vue";

const classes = useClasses();
const { classList, unhelpfulLength } = storeToRefs(classes);
</script>

<template>
    <main>
        <div id="classes" v-if="unhelpfulLength > 0">
            <h1>you have (0.5*{{ unhelpfulLength }}) classes:</h1>
            <Class v-for="Class in classList" :key="Class.name" :Class="Class" />
        </div>
        <h1 v-else>you have NO classes...</h1>
    </main>
</template>
