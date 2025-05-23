<template>
  <div :style="{ userSelect: canSelect, WebkitUserSelect: canSelect }">
    <header id="main">
      <h1>the noteinator</h1>
      <div v-if="helpfulLength > 0">
        <h2>you have {{ helpfulLength }} note{{ helpfulLength > 1 ? 's' : '' }}</h2>
      </div>
      <h2 v-else>you have NO notes...</h2>
      <div id="inputs">
        <button @click="notes.addNote(`note #${helpfulLength + 1}`, 300)">create a note</button>
        <button @click="arrange">arrange notes</button>
        <button @click="save">save notes</button>
        <button @click="loadNotes">load notes</button>
        <button @click="clear">clear notes</button>
        <label>
          list notes? (touchscreen friendly)
          <input type="checkbox" v-model="pos" @change="applySettings" />
        </label>
        <label>
          dark mode?
          <input type="checkbox" v-model="isDark" @change="applySettings" />
        </label>
        <label>
          heatsinks?
          <input type="checkbox" v-model="heatsinks" @change="applySettings" />
        </label>
      </div>
      <a
        href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
        target="_blank"
        rel="noopener noreferrer"
        >markdown guide (github flavored markdown)</a
      >
    </header>
    <div id="notes">
      <NoteComponent
        v-for="note in noteList"
        :note="note"
        :position="pos ? 'static' : 'absolute'"
        @explode="explode"
        @yeehaw="toggleSelect"
        @spotlight="notes.spotlight"
        :key="note.id"
        :heatsinks="heatsinks"
      />
    </div>
    <div id="notifications">
      <TransitionGroup name="notifications">
        <ToastComponent
          v-for="notification in notifications"
          :message="notification[0]"
          :key="notification[1]"
        ></ToastComponent>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '@/types/note'
import NoteComponent from '@/components/NoteComponent.vue'
import ToastComponent from '@/components/ToastComponent.vue'
import { storeToRefs } from 'pinia'
import { useNotesStore } from '@/stores/notes.js'
import { ref, computed, onMounted } from 'vue'

const heatsinks = ref(false)

/**
 * if this is true, dragging notes will be disabled
 */
const pos = ref(false)

const isDark = ref(document.body.classList.contains('dark'))

const notes = useNotesStore()
const { noteList } = storeToRefs(notes)
const helpfulLength = computed(() => {
  return noteList.value.length * 1
})

const notifications = ref<[string, string][]>([])

function explode(note: Note) {
  // because explosions change index so you can't just save an index inside note object and be done with it
  noteList.value.splice(noteList.value.indexOf(note), 1)
  notes.updateZ()
}

// don't let user select text while dragging a note
const canSelect = ref<'none' | 'initial'>('initial')
function toggleSelect(x: 'stop' | 'go') {
  canSelect.value = x === 'go' ? 'none' : 'initial'
}

// arrange notes based on default css positioning
function arrange() {
  // static everyone
  noteList.value.forEach((note) => {
    const element = document.querySelector(`.card#id${note.z}`) as HTMLElement
    if (!element) return

    element.style.position = 'static'
    const pos = element.getBoundingClientRect()
    note.x = pos.x
    note.y = pos.y
  })

  // restore absolte positioning
  noteList.value.forEach((note) => {
    const element = document.querySelector(`.card#id${note.z}`) as HTMLElement
    if (!element) return

    element.style.position = 'absolute'
    element.style.left = note.x + 'px'
    element.style.top = note.y + 'px'
  })
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type: string) {
  let storage
  try {
    // @ts-expect-error this function is in js and i am not dealing with that
    storage = window[type]
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === 'QuotaExceededError' &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    )
  }
}

function addNotification(msg: string) {
  // make a "unique" key
  notifications.value.push([msg, `${Date.now()};${notifications.value.length}`])
  clearNotification()
  if (notifications.value.length % 10 === 0) {
    notifications.value.push(['Slow down!!!!', `${Date.now()};${notifications.value.length}`])
    clearNotification()
  }
}

/**
 * waits 5s, then clears the oldest notification
 */
function clearNotification() {
  setTimeout(() => {
    notifications.value.splice(0, 1)
  }, 5000)
}

function save() {
  if (!storageAvailable('localStorage')) {
    addNotification(`❌ your browser does NOT support saving notes :(`)
    return
  }
  try {
    localStorage.setItem('notes', JSON.stringify(noteList.value))
    addNotification(`saved ${noteList.value.length} note${noteList.value.length === 1 ? '' : 's'}`)
  } catch {
    addNotification(`❌ save failed (size limit exceeded?)`)
  }
}

function loadNotes() {
  if (!storageAvailable('localStorage')) {
    addNotification(`❌ your browser does NOT support saving notes :(`)
    return
  }
  if (!localStorage.getItem('notes')) {
    addNotification(`no saved notes found!`)
    return
  }
  // load saved notes
  const loadNotes = Array.from(JSON.parse(localStorage.getItem('notes') || '[]')) as Note[]

  const defaultNote: Note = {
    id: '-1',
    name: 'a note',
    max: 300,
    z: 0,
    x: 0,
    y: 0,
    focus: false,
    content: '',
    temp: 0,
    width: 200,
    height: 100,
  }

  const cookedNotes = loadNotes.map((note, index) => {
    // set any missing properties
    const copy = Object.assign({}, defaultNote)
    note = Object.assign(copy, note)

    // remove any excess properties
    const keys = Object.keys(note)
    const defaultKeys = new Set(Object.keys(defaultNote))
    if (keys.length !== defaultKeys.size) {
      keys.forEach((key) => {
        if (!defaultKeys.has(key)) delete note[key]
      })
    }

    // handle notes that don't have keys
    if (!note.id || note.id === '-1') {
      console.log('WEE WOO WEE WOO', note.id)
      note.id = `${Date.now()}${index}`
    }

    return note
  })

  notes.set(cookedNotes)
  addNotification(`loaded ${loadNotes.length} note${loadNotes.length === 1 ? '' : 's'}`)
}

function clear() {
  if (window.confirm('do you REALLY want to clear all your notes?')) {
    notes.set([])
    addNotification(`cleared notes`)
  }
}

function applySettings() {
  document.body.classList[isDark.value ? 'add' : 'remove']('dark')
  document.documentElement.style.setProperty('--background', isDark.value ? 'black' : 'white')

  try {
    localStorage.setItem('display', String(pos.value))
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    localStorage.setItem('heatsinks', String(heatsinks.value))
  } catch {
    alert("you seriously don't have enough space to store 3 checkbox settings????")
  }
}

onMounted(() => {
  loadNotes()
  // load display setting
  // for mobile, automatically disable note dragging (because it doesn't work on mobile)
  const savedDisplay = localStorage.getItem('display')
  pos.value = savedDisplay ? savedDisplay === 'true' : navigator.maxTouchPoints > 1

  const savedHeatsinks = localStorage.getItem('heatsinks')
  heatsinks.value = savedHeatsinks === 'true'

  applySettings()
})
</script>

<style scoped>
#main {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffffdd;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

body.dark #main {
  background-color: #000000dd;
  border-bottom: 2px solid white;
}

h1,
h2 {
  font-family: cursive;
  text-align: center;
  margin: 0 0.1rem;
}

h1 {
  text-decoration: underline;
}

#notes {
  display: flex;
  flex-wrap: wrap;
  align-self: stretch;
}

#inputs {
  display: flex;
  justify-content: space-around;
  gap: 1ch;
  margin: 0.5rem 0;
}

#notifications {
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 0.5rem;
}

.notifications-item {
  position: static;
  display: block;
}

.notifications-move,
.notifications-enter-active,
.notifications-leave-active {
  transition: 0.2s ease-out;
  transition-property: transform, opacity, top;
}

.notifications-enter-from,
.notifications-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
