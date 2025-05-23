<template>
  <div
    class="card"
    ref="cardElement"
    :class="note.focus ? 'active' : ''"
    :style="{ left: note.x + 'px', top: note.y + 'px', zIndex: note.z, position: position }"
    @mousedown="emits('spotlight', note)"
    :id="'id' + note.z"
  >
    <div class="title" :style="{ cursor: cursor }">
      <h3
        @mousedown.exact="startMove"
        @input="titleEdited"
        contenteditable="true"
        ref="titleElement"
        title="DRAG titlebar to move, CONTROL CLICK to rename note"
        autocomplete="off"
      >
        {{ title }}
      </h3>
      <button @click="die" title="delete note">x</button>
    </div>
    <div id="content">
      <div id="left">
        <textarea
          ref="textareaElement"
          @input="heat"
          @blur="endEdit"
          title="use markdown formatting"
          v-model="note.content"
        ></textarea>
        <div id="output" ref="mdElement" @dblclick="startEdit" title="DOUBLE CLICK to edit"></div>
        <output style="cursor: help" title="Notes will explode when overheated" tabindex="0"
          >Temperature: {{ Math.round((note.temp / note.max) * 100) }}%</output
        >
      </div>
      <div id="temp">
        <span class="barBackground">
          <span
            class="bar"
            :style="{
              height: (note.temp * 100) / note.max + '%',
              backgroundColor: note.temp > note.max * 0.75 ? 'rgb(255,0,0)' : 'rgb(255,255,0)',
            }"
          ></span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '@/types/note'
import { onMounted, ref } from 'vue'
import DOMPurify from 'dompurify'
import { marked, Renderer } from 'marked'
const renderer = new Renderer()
renderer.link = function (lonk) {
  return `<a target="_blank" href="${lonk.href}">${lonk.text}` + '</a>'
}

marked.use({ gfm: true, breaks: true, renderer })

let ticking = false

const props = defineProps<{ note: Note; position: 'static' | 'absolute'; heatsinks: boolean }>()

// explode: delete note, yeehaw: disable selecting (used when dragging)
const emits = defineEmits(['explode', 'yeehaw', 'spotlight'])

// https://vuejs.org/guide/essentials/template-refs.html
const cardElement = ref()
const titleElement = ref()
const textareaElement = ref()
const mdElement = ref()

// the title of the note
const title = ref('')

// vars that handle mouse dragging
let x = 0
let y = 0
const cursor = ref('grab')

// set width of titleelement
function changeWidth(event: ResizeObserverEntry[]) {
  if (!titleElement.value) return

  const size = event[0].target.getBoundingClientRect()
  if (size.width < 1) return
  titleElement.value.style.maxWidth = `calc(${Math.max(200, size.width)}px + 0.5rem - 1ch - 22px)`
  props.note.width = size.width
  props.note.height = size.height
}

// both startmove and die call this. resume normal select behavior and stop dragging
function mouseUp() {
  emits('yeehaw', 'stop')
  cursor.value = 'grab'
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', mouseUp)
  if (titleElement.value) {
    // shoutout to firefox for just Not Supporting plaintext-only
    titleElement.value.contentEditable = 'true'
  }
}

// mouseUp calls this when removing
function mouseMove(event: MouseEvent) {
  // These numbers came to me in a dream
  props.note.x = event.pageX - x - 4
  props.note.y = event.pageY - y - 2
  // props.note.temp -= Math.floor((Math.abs(event.movementX / window.innerWidth) + Math.abs(event.movementY / window.innerHeight)) * 100);
  if (props.note.temp > 0) props.note.temp--
}

function startMove(event: MouseEvent) {
  // if we are currently editing the title, do not drag
  if (cursor.value === 'text') return

  titleElement.value.contentEditable = 'false'
  emits('yeehaw', 'go')
  x = event.offsetX
  y = event.offsetY
  cursor.value = 'grabbing'
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', mouseUp)
}

// user is now editing the textarea. stop displaying markdown
function startEdit() {
  const mdSize = mdElement.value.getBoundingClientRect()
  mdElement.value.style.display = 'none'
  textareaElement.value.style.width = mdSize.width + 'px'
  textareaElement.value.style.height = mdSize.height + 'px'
  textareaElement.value.style.display = 'flex'
  textareaElement.value.focus()
}

async function endEdit() {
  // if you explode a note it counts as endedit (blur), and that means textareaElement won't exist
  if (!textareaElement.value) return

  const textareaSize = textareaElement.value.getBoundingClientRect()
  textareaElement.value.style.display = 'none'
  mdElement.value.innerHTML = DOMPurify.sanitize(await marked.parse(textareaElement.value.value), {
    ADD_ATTR: ['target'],
  })
  mdElement.value.style.width = textareaSize.width + 'px'
  mdElement.value.style.height = textareaSize.height + 'px'
  mdElement.value.style.display = 'block'
}

function heat() {
  props.note.temp += props.heatsinks ? 0.5 : 5
  if (props.note.temp > props.note.max) return void die()

  if (!ticking) tick()
}

function titleEdited() {
  props.note.name = titleElement.value.innerHTML
  heat()
}

function die() {
  mouseUp()
  emits('explode', props.note)
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

async function tick() {
  ticking = true
  const note = props.note
  const delay = 200 + (note.max - note.temp) * 2

  // if note hot, tick it down
  if (note.temp > 0) note.temp--

  // if note not hot, don't tick it down
  if (note.temp === 0) {
    ticking = false
    return
  }

  await wait(delay)
  tick()
}

onMounted(async () => {
  const note = props.note
  cardElement.value.style.zIndex = note.z
  title.value = note.name
  textareaElement.value.style.height = note.height + 'px'
  textareaElement.value.style.width = note.width + 'px'
  mdElement.value.style.height = note.height + 'px'
  mdElement.value.style.width = note.width + 'px'
  new ResizeObserver(changeWidth).observe(textareaElement.value)
  new ResizeObserver(changeWidth).observe(mdElement.value)
  mdElement.value.innerHTML = DOMPurify.sanitize(await marked.parse(textareaElement.value.value), {
    ADD_ATTR: ['target'],
  })
  // don't spawn in the top left corner
  if (!note.x) {
    cardElement.value.style.position = 'static'
    const size = cardElement.value.getBoundingClientRect()
    note.x = size.x
    note.y = size.y
    cardElement.value.style.position = props.position
  }
  // titleElement.value.addEventListener('paste', function (event) {
  //   event.preventDefault()
  //   const text = event.clipboardData.getData('text/plain')
  //   document.execCommand('insertText', false, text)
  // })
  tick()
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Control' && cursor.value !== 'grabbing') cursor.value = 'text'
})
window.addEventListener('keyup', (event) => {
  if (event.key === 'Control' && cursor.value !== 'grabbing') cursor.value = 'grab'
})
window.addEventListener('focus', () => {
  cursor.value = 'grab'
})
</script>

<style scoped>
.card {
  width: min-content;
  height: min-content;
  background-color: rgb(211, 211, 211);
  border: 2px solid black;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: absolute;
}

body.dark .card {
  background-color: rgb(37, 37, 37);
  border: 2px solid white;
}

.card.active {
  /* IS THAT THE GRIM REAPER??? */
  box-shadow: 0 0 5px #666666;
}

body.dark .card.active {
  /* IS THAT THE CHEERY FELLOW??? */
  box-shadow: 0 0 5px #ffffff;
}

.card .title {
  display: flex;
  border-bottom: 2px solid rgb(0, 0, 0);
  gap: 0.5ch;
  background-image: linear-gradient(90deg, #b4b4b4, #dddddd);
  justify-content: space-between;
}

body.dark .card .title {
  border-bottom: 2px solid #ffffff;
  background-image: linear-gradient(90deg, #393939, #444444);
}

.card .title h3 {
  font-weight: normal;
  flex-grow: 1;
  margin: 0;
  margin-left: 0.25ch;
  /* margin-right: 0.5ch; */
  white-space: nowrap;
  overflow-x: hidden;
}

.card .title h3:focus,
.card .title button:focus,
.card textarea:focus {
  outline: none;
}

.card .title button {
  border: none;
  border-left: 1px solid;
  width: 1ch;
  box-sizing: content-box;
}

.card #content {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
}

.card #content #left {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card #content #left textarea {
  display: none;
  border: none;
  flex-grow: 1;
  border-bottom: 1px dotted black;
  min-width: 200px;
  min-height: 100px;
  resize: both;
  padding: 4px;
}

body.dark .card #content #left textarea {
  border-bottom: 1px dotted white;
  background-color: black;
  color: white;
  scrollbar-color: #dddddd black;
}

/* markdown output */
.card #content #left #output {
  display: block;
  border: none;
  flex-grow: 1;
  border-bottom: 1px dotted black;
  /* cuts your hex code in half */
  background: #fff;
  min-width: 200px;
  min-height: 100px;
  overflow-y: auto;
  word-wrap: break-word;
  resize: both;
  padding: 4px;
}

body.dark .card #content #left #output {
  border-color: white;
  /* cuts your hex code in half */
  background: #000;
  scrollbar-color: #dddddd black;
}

/* i'm 14 and this is */
#output:deep(*) {
  margin-top: 0;
  margin-bottom: 0;
}

/* temperature % */
.card #content #left output {
  font-family: monospace;
  min-width: fit-content;
  min-width: -moz-fit-content;
  cursor: default;
  padding-left: 0.1rem;
  padding-bottom: 0.1rem;
}

/* shoutout to the meter element for being not great */
.card #content #temp .barBackground {
  height: 100%;
  width: 0.5rem;
  background-color: rgb(0, 0, 0);
  display: flex;
  align-items: end;
  justify-content: center;
  /* padding: 1px; */
  border-left: 1px solid black;
}

body.dark .card #content #temp .barBackground {
  border-left: 1px solid white;
}

.card #content #temp .barBackground .bar {
  width: 90%;
  /* background-color: rgb(255, 255, 0); */
}
</style>
