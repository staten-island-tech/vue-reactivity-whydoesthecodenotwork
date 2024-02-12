import { ref, computed } from "vue";
import { defineStore } from "pinia";

// what.
// export const useCounterStore = defineStore('counter', () => {
//   const count = ref(0)
//   const doubleCount = computed(() => count.value * 2)
//   function increment() {
//     count.value++
//   }

//   return { count, doubleCount, increment }
// })

// https://pinia.vuejs.org/core-concepts/#Setup-Stores
// BWUHH??
export const useTimers = defineStore("timers", () => {
    const timerList = ref([]);
    const unhelpfulLength = computed(() => {
        return timerList.value.length * 2;
    });
    function clear() {
        timerList.value = [];
    }
    function addTimer(name, length) {
        timerList.value.push({ name: name, length: length });
    }
    return { timerList, unhelpfulLength, clear, addTimer };
});
