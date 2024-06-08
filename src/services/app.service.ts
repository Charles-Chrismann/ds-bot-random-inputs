import { CronJob } from "cron";
import { EnvService, FileService } from ".";
import DiscordService from "./discord.service";
import EmulatorWrapper from "../EmulatorWrapper";
import express from "express";
import { INPUTS } from "../constants";
import Gameboy from 'serverboy'

class AppService {
  emu = new EmulatorWrapper()
  webApp = express()
  backupAndSendJob = new CronJob(
    '0 * * * * *',
    async () => {
      const file = await this.emu.render()
      this.emu.createBackup()
      DiscordService.sendImage(file, EnvService['DISCORD_CHANNEL_ID'])
    },
    null,
    true
  );

  constructor() {
    FileService.loadBackupIfNotExist(this.emu)
    FileService.createChatFileIfNotExist()

    setInterval(() => {
      const input = INPUTS[Math.floor(Math.random()*INPUTS.length)];
      for(let i = 0; i < 19; i++) {
        this.emu.gameboy.pressKey(Gameboy.KEYMAP[input])
        this.emu.gameboy.doFrame()
      }
    }, 100)
  }
}

export default new AppService()