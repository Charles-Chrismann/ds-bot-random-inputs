import * as fs from 'fs'
import Gameboy from 'serverboy'
import {createCanvas} from '@napi-rs/canvas'
import { compress, decompress } from 'compress-json'

async function render() {
  const canvas = createCanvas(160, 144)
  const ctx = canvas.getContext('2d')
  const data = ctx.createImageData(160, 144);
  const screen = gameboy.getScreen()
  for (let i=0; i<screen.length; i++) {
    data.data[i] = screen[i];
  }
  ctx.putImageData(data, 0, 0);
  const pngData = await canvas.encode('png')
  fs.writeFileSync('bu.png', pngData)
}

const gameboy = new Gameboy()
const rom = fs.readFileSync('./pr.gb')
// const memory = decompress(JSON.parse(fs.readFileSync('save.json')))
const memory = JSON.parse(fs.readFileSync('backup.json'))
gameboy.loadRom(rom)
gameboy[Object.keys(gameboy)[0]].gameboy.saving(memory)
console.log(gameboy)
// console.log(gameboy[Object.keys(gameboy)[0]].gameboy.saveState())

for(let i = 0; i < 300; i++) {
  gameboy.pressKey(Gameboy.KEYMAP.B)
  gameboy.doFrame()
}

render()

