import express from "express"
import sanitizer from 'sanitizer'
import fileService from "./services/file.service"
import io from "./io.server"
import GbaEmulatorWrapper from "./GbaEmulatorWrapper"
import appService from "./services/app.service"

const app = express()

app.use(express.json())
app.use(express.static('public'))
app.post('/api/chat', (req, res) => {
  const {user, message} = req.body as {user: string, message: string}
  if(!user || !message) return res.sendStatus(400)
  const messageObj = {user: sanitizer.escape(user), message: sanitizer.escape(message)}
  fileService.pushChat(messageObj)
  io.emit('chat', messageObj)
  return res.sendStatus(201)
})

app.get('/api/gba/save', async (req, res) => {
  return res.send(await appService.emu.flashBackup())
})

export default app