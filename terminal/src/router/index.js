import { createRouter, createWebHistory } from "vue-router";
import Terminal from "../views/Terminal.vue";

// WHAT KIND OF PLACE IS THIS??

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "terminal",
            component: Terminal,
        },
    ],
});

export default router;
