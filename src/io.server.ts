import { Server } from "socket.io"
import sanitizer from 'sanitizer'
import { AppService, FileService } from "./services"
import HTTPServer from "./http.server"
import EmulatorWrapper from "./EmulatorWrapper"
import { computeFrameDiff } from "./services/utils.service"

const io = new Server(HTTPServer)
let lastSentFrame : number[] | null = null
let wsIntervalId: NodeJS.Timeout | null = null

io.on('connection', (socket) => {
  if(io.engine.clientsCount === 1) startWsInterval()
  console.log('user connected')
  socket.emit('frame', lastSentFrame ?? AppService.emu.getScreen())

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

function startWsInterval() {
  wsIntervalId = setInterval(() => {
    if(!lastSentFrame) {
      lastSentFrame = AppService.emu.getScreen()
      io.emit('diff', lastSentFrame)
    } else {
      const current = AppService.emu.getScreen()
      const diff = computeFrameDiff(lastSentFrame, current)
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

export default io