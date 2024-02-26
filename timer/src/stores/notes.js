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
export const useNotes = defineStore("notes", () => {
    const noteList = ref([]);
    let list = noteList.value;
    const helpfulLength = computed(() => {
        return noteList.value.length * 1;
    });
    function clear() {
        list = [];
    }
    function addNote(name, max) {
        list.push({ name: name, max: max, z: noteList.value.length, x: 0, y: 0, focus: false });
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
    function spotlight(Note) {
        // console.log("all eyes on " + Note);
        list.filter((note) => note.z > Note.z).forEach((note) => {
            note.z--;
        });
        list.forEach((note) => {
            note.focus = false;
        });
        Note.z = list.length - 1;
        Note.focus = true;
    }
    function spotdark() {
        list.forEach((note) => {
            note.focus = false;
        });
    }
    return { noteList, helpfulLength, clear, addNote, updateZ, spotlight, spotdark };
});
