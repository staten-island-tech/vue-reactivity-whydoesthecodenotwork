/**
 * @param name - the name/title of the note
 * @param id - note of the id, used as v-for key
 * @param content - the content of the note in markdown
 * @param width - width of textbox in px
 * @param height - height of textbox in px
 * @param x - x position
 * @param y - y position
 * @param z - z-index
 * @param temp - the temperature of the note
 * @param max - the max temperature of each note
 * @param focus - is the note focused? (last clicked)
 */
type Note = {
  id: string
  name: string
  content: string
  width: number
  height: number
  x: number
  y: number
  z: number
  temp: number
  max: number
  focus: boolean
  // index signature for wacky type hijinks
  [key: string]: unknown
}

export type { Note }
