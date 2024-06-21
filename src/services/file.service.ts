import * as fs from 'fs'
import { EnvService } from '.'
import GbaEmulatorWrapper from '../GbaEmulatorWrapper'
import { formatDate } from './utils.service'

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

  private _backup!: string
  get backup() {
    this._backup = fs.readFileSync(EnvService['BACKUP_PATH']).toString()
    return this._backup
  }
  set backup(value) {
    fs.writeFileSync(EnvService['BACKUP_PATH'], JSON.stringify(value))
    this._backup = value
  }

  private _bios!: Buffer
  get bios() {
    this._bios = fs.readFileSync(EnvService['BIOS_FILE'])
    return this._bios
  }

  private _rom!: Buffer
  get rom() {
    this._bios = fs.readFileSync(EnvService['ROM_FILE'])
    return this._bios
  }

  pushChat(message: { user: string, message: string }) {
    const chat = this.chat
    const messageEntity = {...message, createdAt: formatDate()}
    chat.push(messageEntity)
    this.chat = chat
  }

  createChatFileIfNotExist() {
    if(fs.existsSync(EnvService['CHAT_PATH'])) return
    fs.writeFileSync(EnvService['CHAT_PATH'], '[]')
  }

  async loadBackupIfExist(emu: GbaEmulatorWrapper) {
    if(!fs.existsSync(EnvService['BACKUP_PATH'])) return
    await emu.loadBackup(this.backup)
  }

  createBackup(data: string) {
    fs.writeFileSync(EnvService['BACKUP_PATH'], data)
  }
}

export default new FileService