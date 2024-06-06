import * as fs from 'fs'

async function sendMessage() {
  const file = fs.readFileSync('./frame.png');

  const attachementRes = await fetch(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/attachments`, {
    headers: {
      "Authorization": process.env.DISCORD_TOKEN,
      "Content-Type": "application/json",
    },
    method: 'POST',
    body: JSON.stringify({
      files: [
        {
          file_size: file.byteLength,
          filename: "frame.png",
          id: 22,
          is_clip: false
        }
      ]
    })
  });

  const attachementData = await attachementRes.json()

  const uploadRes = await fetch(attachementData.attachments[0].upload_url, {
    headers: {
      "Authorization": process.env.DISCORD_TOKEN,
      "Content-Type": "application/octet-stream",
    },
    method: 'PUT',
    body: file
  })

  const messageRes = await fetch(`https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/messages`, {
    headers: {
      "Authorization": process.env.DISCORD_TOKEN,
      "Content-Type": "application/json",
    },
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
  console.log(messageData)
}


export { sendMessage }