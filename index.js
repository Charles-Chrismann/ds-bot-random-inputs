import 'dotenv/config'
import * as fs from 'fs'
import {createCanvas} from '@napi-rs/canvas'
import Gameboy from 'serverboy'
import { CronJob } from 'cron';
import { sendMessage } from './send.js';

function backup() {
  const memory = gameboy[Object.keys(gameboy)[0]].gameboy.saveState()
  fs.writeFileSync('backup.json', JSON.stringify(memory))
  console.log('backuped')
}

function load() {
  gameboy = new Gameboy()
  gameboy.loadRom(rom)
  const memory = JSON.parse(fs.readFileSync('backup.json'))
  gameboy[Object.keys(gameboy)[0]].gameboy.saving(memory)
  console.log('loaded')
}

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
  fs.writeFileSync('frame.png', pngData)
}

let gameboy = new Gameboy()
const rom = fs.readFileSync('./pr.gb')
gameboy.loadRom(rom)

const inputs = [
  "RIGHT",
  "LEFT",
  "UP",
  "DOWN",
  "A",
  "B",
  "SELECT",
  "START"
]

setInterval(async () => {
  const input = inputs[Math.floor(Math.random()*inputs.length)];
  for(let i = 0; i < 19; i++) {
    gameboy.pressKey(Gameboy.KEYMAP[input])
    gameboy.doFrame()
  }
}, 100)

const job = new CronJob(
	'0 * * * * *',
	async () => {
    await render()
    backup()
    sendMessage()
	},
  null,
  true
);