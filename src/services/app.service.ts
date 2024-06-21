import { CronJob } from "cron";
import { EnvService, FileService } from ".";
import DiscordService from "./discord.service";
import EmulatorWrapper from "../EmulatorWrapper";
import express from "express";
import { INPUTS } from "../constants";
import Gameboy from 'serverboy'
import GbaEmulatorWrapper from "../GbaEmulatorWrapper";

class AppService {
  emu = new GbaEmulatorWrapper()
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
    this.setup()
  }

  async setup() {
    await FileService.loadBackupIfExist(this.emu)
    FileService.createChatFileIfNotExist()

    this.emu.startRandomInputsSession()
    // setInterval(() => {
    //   const input = INPUTS[Math.floor(Math.random()*INPUTS.length)];
    //   for(let i = 0; i < 19; i++) {
    //     this.emu.gameboy.pressKey(Gameboy.KEYMAP[input])
    //     this.emu.gameboy.doFrame()
    //   }
    // }, 100)
  }
}

export default new AppService()