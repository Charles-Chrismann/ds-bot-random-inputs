import 'dotenv/config'
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { CronJob } from "cron";
import sanitizer from 'sanitizer'
import EmulatorWrapper from "./EmulatorWrapper";
import inputs from './inputs'
import Gameboy from 'serverboy'
import { EnvService, FileService, DiscordService } from './services';

const PORT = process.env.PORT || 3000
const emu = new EmulatorWrapper()
FileService.loadBackupIfNotExist(emu)
FileService.createChatFileIfNotExist()

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
  io.emit("chat history", FileService.chat)

  socket.on("chat", (data: {user: string, message: string}) => {
    const messageObj = {user: sanitizer.escape(data.user), message: sanitizer.escape(data.message)}
    io.emit("chat", messageObj)
    FileService.pushChat(messageObj)
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
    DiscordService.sendImage(file, EnvService['DISCORD_CHANNEL_ID'])
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