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
export const useClasses = defineStore("classes", () => {
    const classList = ref([{ name: "Liberal Class", description: "Mandatory liberal class, taught by Joe Biden" }]);
    const unhelpfulLength = computed(() => {
        return classList.value.length * 2;
    });
    function clear() {
        classList.value = [];
    }
    function addClass(className, classDescription) {
        classList.push({ name: className, description: classDescription });
    }
    return { classList, unhelpfulLength, clear, addClass };
});
