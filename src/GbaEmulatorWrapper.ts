import { createCanvas } from '@napi-rs/canvas'
import * as fs from 'fs'
import { GameBoyAdvance } from './gba/gba.js'
import { dataURItoBlob, encode, getRandomInt, toArrayBuffer } from './services/utils.service'
import fileService from './services/file.service'
import { Serializer, Pointer } from './gba/util.js'
import { INPUTS } from './constants/'
import type { input } from '../types'

class GbaEmulatorWrapper {
  gba!: GameBoyAdvance
  canvas = createCanvas(240, 160)
  randomInputsSessionIntervalId: NodeJS.Timeout | null = null
  nextInputs: input[] = []

  constructor() {
    this.resetGba()

    if(process.env.NODE_ENV !== "production")setInterval(async () => {
      let keypad = this.gba.keypad;
      keypad.press(keypad.A);
      
      await this.render()
    }, 200);
  }

  resetGba() {
    if(this.gba) this.gba.pause()
    this.gba = new GameBoyAdvance()
    this.gba.logLevel = this.gba.LOG_ERROR;

    this.gba.setBios(toArrayBuffer(fileService.bios))
    this.gba.setCanvas(this.canvas)

    this.gba.loadRom(fileService.rom)
    this.gba.runStable()
  }

  async render() {
    const pngData = await this.canvas.encode('png')
    fs.writeFileSync('./generated/frame.png', pngData)
    return pngData
  }

  async createBackup() {
    this.gba.pause()
    const freeze = this.gba.freeze() as any

    const ser = Serializer.serialize(freeze)
    const data = 'data:application/octet-stream;base64,' + encode(new Uint8Array(await ser.arrayBuffer()))
    fileService.createBackup(data)

    this.gba.runStable()
  }

  async loadBackup(memory: string) {
    this.canvas = createCanvas(240, 160)
    this.resetGba()

    const state = await dataURItoBlob(memory).arrayBuffer()
    const out = Serializer.deserealizeStream(new DataView(state), new Pointer())
    this.gba.pause()
    this.gba.defrost(out)
    this.gba.runStable()
  }

  getScreen(x = 0, y = 0, w = this.canvas.width, h = this.canvas.height) {
    return Array.from(this.canvas.getContext('2d').getImageData(x, y, w, h).data)
  }

  startRandomInputsSession() {
    this.randomInputsSessionIntervalId = setInterval(() => {
      if(this.nextInputs.length) {
        const next = this.nextInputs.pop()!
        this.gba.keypad.press(this.gba.keypad[next])
        return
      }
      let max = INPUTS.reduce((acc, curr) => acc + curr.luck, 0)
      let ma = getRandomInt(max) + 1

      for(const input of INPUTS) {
        ma -= input.luck
        if(ma <= 0) {
          this.nextInputs = []
          for(let i = 0; i <= getRandomInt(input.range) + 1; i++) {
            this.nextInputs.push(input.key)
          }
          break;
        }
      }
    }, 100)
  }

  stopRandomInputsSession() {
    if(this.randomInputsSessionIntervalId) clearInterval(this.randomInputsSessionIntervalId)
  }
}

export default GbaEmulatorWrapper