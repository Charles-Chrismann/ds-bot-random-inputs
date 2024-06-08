import 'dotenv/config'
import express from "express";
import { Server } from "socket.io";
import EmulatorWrapper from "./EmulatorWrapper";
import { createServer } from "http";
import { CronJob } from "cron";
import Discord from "./Discord";
import * as fs from 'fs'
import inputs from './inputs'
import Gameboy from 'serverboy'
import sanitizer from 'sanitizer'

const PORT = process.env.PORT || 3000
const emu = new EmulatorWrapper()
if(fs.existsSync(process.env.BACKUP_PATH as string)) {
  const memory = JSON.parse(fs.readFileSync(process.env.BACKUP_PATH as string).toString())
  emu.loadBackup(memory)
}
if(!fs.existsSync(process.env.CHAT_PATH as string)) {
  fs.writeFileSync(process.env.CHAT_PATH as string, '')
}

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.static('public'))

io.on('connection', (socket) => {
  if(io.engine.clientsCount === 1) startWsInterval()
  console.log('user connected')
  socket.emit('frame', lastSentFrame ?? emu.gameboy.getScreen())

  io.emit("viewer join", io.engine.clientsCount)
  const chatHistory = JSON.parse(fs.readFileSync(process.env.CHAT_PATH as string).toString())
  io.emit("chat history", chatHistory)

  socket.on("chat", (data: {user: string, message: string}) => {
    const messageObj = {user: sanitizer.escape(data.user), message: sanitizer.escape(data.message)}
    io.emit("chat", messageObj)
    const chat = JSON.parse(fs.readFileSync(process.env.CHAT_PATH as string).toString()) as {user: string, message: string}[]
    chat.push(messageObj)
    fs.writeFileSync(process.env.CHAT_PATH as string, JSON.stringify(chat))
  })

  socket.on('disconnect', () => {
    if(io.engine.clientsCount === 0) stopWsInterval()
    io.emit("viewer join", io.engine.clientsCount)
  })
})

let lastSentFrame : number[] | null = null
let wsIntervalId: NodeJS.Timeout | null = null

server.listen(3000, () => {
  console.log('Server running on port', PORT)
})

const job = new CronJob(
	'0 * * * * *',
	async () => {
    const file = await emu.render()
    emu.createBackup()
    Discord.sendImage(file, process.env.DISCORD_CHANNEL_ID as string)
	},
  null,
  true
);

setInterval(() => {
  const input = inputs[Math.floor(Math.random()*inputs.length)];
  for(let i = 0; i < 19; i++) {
    emu.gameboy.pressKey(Gameboy.KEYMAP[input])
    emu.gameboy.doFrame()
  }
}, 100)

function startWsInterval() {
  wsIntervalId = setInterval(() => {
    if(!lastSentFrame) {
      lastSentFrame = emu.gameboy.getScreen()
      io.emit('diff', lastSentFrame)
    } else {
      const current = emu.gameboy.getScreen()
      const diff = EmulatorWrapper.computeFrameDiff(lastSentFrame, current)
      if(diff.length) io.emit('diff', diff)
      lastSentFrame = current
    }
  }, 100)
}

function stopWsInterval() {
  if(!wsIntervalId) return
  clearInterval(wsIntervalId)
  wsIntervalId = null
}