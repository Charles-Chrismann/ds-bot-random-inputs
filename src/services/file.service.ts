import * as fs from 'fs'
import { EnvService } from '.'
import EmulatorWrapper from '../EmulatorWrapper'

class FileService {
  private _chat!: { user: string, message: string }[]
  get chat() {
    this._chat = JSON.parse(fs.readFileSync(EnvService['CHAT_PATH']).toString())
    return this._chat
  }
  set chat(value) {
    fs.writeFileSync(EnvService['CHAT_PATH'], JSON.stringify(value))
    this._chat = value
  }

  private _backup!: any[]
  get backup() {
    this._backup = JSON.parse(fs.readFileSync(EnvService['BACKUP_PATH']).toString())
    return this._backup
  }
  set backup(value) {
    fs.writeFileSync(EnvService['BACKUP_PATH'], JSON.stringify(value))
    this._backup = value
  }

  pushChat(message: { user: string, message: string }) {
    const chat = this.chat
    chat.push(message)
    this.chat = chat
  }

  createChatFileIfNotExist() {
    if(fs.existsSync(EnvService['CHAT_PATH'])) return
    fs.writeFileSync(EnvService['CHAT_PATH'], '[]')
  }

  loadBackupIfNotExist(emu: EmulatorWrapper) {
    if(!fs.existsSync(EnvService['BACKUP_PATH'])) return
    emu.loadBackup(this.backup)
  }
}

export default new FileService