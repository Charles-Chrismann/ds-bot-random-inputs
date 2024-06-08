class DiscordService {
  static async sendImage(file: Buffer, channelId: string) {

    const attachementRes = await fetch(`https://discord.com/api/v9/channels/${channelId}/attachments`, {
      headers: new Headers({
        "Authorization": process.env.DISCORD_TOKEN as string,
        "Content-Type": "application/json",
      }),
      method: 'POST',
      body: JSON.stringify({
        files: [
          {
            file_size: file.byteLength,
            filename: "frame.png",
            id: 1,
            is_clip: false
          }
        ]
      })
    });

    const attachementData = await attachementRes.json()

    const uploadRes = await fetch(attachementData.attachments[0].upload_url, {
      headers: new Headers({
        "Authorization": process.env.DISCORD_TOKEN as string,
        "Content-Type": "application/octet-stream",
      }),
      method: 'PUT',
      body: file
    })

    const messageRes = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
      headers: new Headers({
        "Authorization": process.env.DISCORD_TOKEN as string,
        "Content-Type": "application/json",
      }),
      method: 'POST',
      body: JSON.stringify({
        attachments: [
          {
            filename: "frame.png",
            id: String(attachementData.attachments[0].id),
            uploaded_filename: attachementData.attachments[0].upload_filename
          },
        ]
      })
    })

    const messageData = await messageRes.json()
  }
}

export default DiscordService