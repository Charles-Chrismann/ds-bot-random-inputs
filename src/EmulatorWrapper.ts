import { createCanvas } from '@napi-rs/canvas'
import * as fs from 'fs'
import Gameboy from 'serverboy'
import GameBoyCore from 'serverboy/src/gameboy_core/gameboy.js'
import fileService from './services/file.service'

class EmulatorWrapper {
  gameboy: typeof Gameboy
  private _deepGameboy: typeof GameBoyCore
  private updateIntervalId: NodeJS.Timeout | null = null

  constructor() {
    this.gameboy = new Gameboy()
    this.gameboy.loadRom(fileService.rom)
  }

  get deepGameboy(): typeof GameBoyCore {
    return this.gameboy[Object.keys(this.gameboy)[0]].gameboy
  }

  set deepGameboy(value: typeof GameBoyCore) {
    this._deepGameboy = value
  }

  public loadBackup(memory: any[]) {
    this.gameboy = new Gameboy()
    this.gameboy.loadRom(fileService.rom)
    this.deepGameboy.saving(memory)
    this.skipFrames(100)
  }

  public createBackup() {
    const memory = this.deepGameboy.saveState()
    fs.writeFileSync(process.env.BACKUP_PATH as string, JSON.stringify(memory))
  }

  public skipFrames(frameCount: number) {
    for(let i = 0; i < frameCount; i++) this.gameboy.doFrame()
  }

  startUdateSession() {
    this.updateIntervalId = setInterval(() => {
      this.gameboy.doFrame()
    }, 5)
  }

  interupteUpdateSession() {
    if(!this.updateIntervalId) return
    clearInterval(this.updateIntervalId)
  }

  async render() {
    const canvas = createCanvas(160, 144)
    const ctx = canvas.getContext('2d')
    const data = ctx.createImageData(160, 144);
    const screen = this.gameboy.getScreen()
    for (let i=0; i<screen.length; i++) {
      data.data[i] = screen[i];
    }
    ctx.putImageData(data, 0, 0);
    const pngData = await canvas.encode('png')
    fs.writeFileSync(process.env.FRAME_PATH as string, pngData)
    return pngData
  }
}

export default EmulatorWrapper