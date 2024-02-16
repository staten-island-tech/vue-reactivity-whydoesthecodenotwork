import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", () => {
    const count = ref([
        {
            name: "mario",
            money: 500,
        },
        {
            name: "luigi",
            money: 5000,
        },
        {
            name: "wario",
            money: -500000,
        },
        {
            name: "waluigi",
            money: 0,
        },
    ]);
    // const doubleCount = computed(() => count.value * 2);
    // function increment() {
    //     count.value++;
    // }

    return { count };
});
