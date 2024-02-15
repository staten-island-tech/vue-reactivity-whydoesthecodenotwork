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
    let list = timerList.value;
    const unhelpfulLength = computed(() => {
        return timerList.value.length * 2;
    });
    function clear() {
        list = [];
    }
    function addTimer(name, length) {
        list.push({ name: name, length: length, z: timerList.value.length });
    }
    function updateZ() {
        list.sort((a, b) => {
            return a.z > b.z;
        });
        for (let i = 0; i < list.length; i++) {
            list[i].z = i;
        }
    }
    // i was not expecting to have to make a window management system
    function spotlight(Timer) {
        // console.log("all eyes on " + Timer);
        list.filter((timer) => timer.z > Timer.z).forEach((timer) => {
            timer.z--;
        });
        Timer.z = list.length;
    }
    return { timerList, unhelpfulLength, clear, addTimer, updateZ, spotlight };
});
