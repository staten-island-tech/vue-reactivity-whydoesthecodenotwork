import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Note } from '@/types/note'

export const useNotesStore = defineStore('notes', () => {
  const noteList = ref<Note[]>([])

  function set(x: Note[]) {
    noteList.value = [...x]
  }

  function addNote(name: string, max: number) {
    noteList.value.push({
      id: `${Date.now()}${noteList.value.length}`,
      name: name,
      content: '',
      width: 200,
      height: 100,
      x: 0,
      y: 0,
      z: noteList.value.length,
      temp: 0,
      max: max,
      focus: false,
    })
  }

  function updateZ() {
    noteList.value.sort((a, b) => a.z - b.z)
    for (let i = 0; i < noteList.value.length; i++) {
      noteList.value[i].z = i
    }
  }

  function spotlight(note: Note) {
    noteList.value
      .filter((noot) => noot.z > note.z)
      .forEach((noot) => {
        noot.z--
      })
    noteList.value.forEach((noot) => {
      noot.focus = false
    })
    note.z = noteList.value.length - 1
    note.focus = true
  }

  return { noteList, set, addNote, updateZ, spotlight }
})
