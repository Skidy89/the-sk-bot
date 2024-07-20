import { client } from "../core"
import { WASticker } from "../lib/"
import { MessageSerialize } from "../types"


const wasticker = new WASticker({
    pack: "made with skid bot",
    author: "",
    categories: ["👋"]
  })
  
  export = {
    name: 'sticker',
    description: 'envía un sticker',
    async handle(conn: client, m: MessageSerialize) {
      var args = m.body.trim().split(/\s+/).slice(1)
      if (m.type.includes("imageMessage") || (m.quoted && m.quoted?.type?.includes("imageMessage"))) {
        if (args[0] && args[0].includes("--steal")) {
          const pack = args[1] || 'stealed!!'
          const author = args[2] || "skid-bot"
          const stealer = new WASticker({ pack, author })
          const buffer = m.quoted ? await m.quoted.download() : await conn.downloadMediaMessage(m)
          const result = await stealer.ConvertMedia(buffer, "image")
          return await conn.sendMessage(m.chat, {  sticker: result, isAnimated: true }, { quoted: m })

        } else {
        const buffer = m.quoted ? await m.quoted.download() : await conn.downloadMediaMessage(m)
        const result = await wasticker.ConvertMedia(buffer, "image")
  
        return await conn.sendMessage(m.chat, { sticker: result, isAnimated: true }, { quoted: m})}
      } else if (m.type.includes("videoMessage") || (m.quoted && m.quoted?.type?.includes("videoMessage"))) {
        if (args[0] && args[0].includes("--steal")) {
          const pack = args[1] || 'stealed!!'
          const author = args[2] || "skid-bot"
          const stealer = new WASticker({ pack, author })
          const buffer = m.quoted ? await m.quoted.download() : await conn.downloadMediaMessage(m)
          const result = await stealer.ConvertMedia(buffer, "image")
          return await conn.sendMessage(m.chat, { sticker: result, isAnimated: true }, { quoted: m })

        } else {
        const duration = m.quoted ? m.quoted.message.videoMessage.seconds : m.message.videoMessage.seconds
            if (duration && !isNaN(duration) && duration > 10) conn.reply(m.chat, "la duracion del video es muy largo\n maximo 10 segundos", m)
      
            const buffer = m.quoted ? await m.quoted.download() : await conn.downloadMediaMessage(m)
            const result = await wasticker.ConvertMedia(buffer, "video")
      
            return await conn.sendMessage(m.chat, {  sticker: result, isAnimated: true }, { quoted: m })}
      } else if (m.type.includes("stickerMessage") || (m.quoted && m.quoted.type.includes("stickerMessage"))) {
        if (args[0] && args[0].includes("--steal")) {
          const pack = args[1] || 'stealed!!'
          const author = args[2] || "skid-bot"
          const stealer = new WASticker({ pack, author })
          const buffer = m.quoted ? await m.quoted.download() : await conn.downloadMediaMessage(m)
          const result = await stealer.ConvertMedia(buffer, "image")
          return await conn.sendMessage(m.chat, { sticker: result }, { quoted: m })

        } else {
        const buffer = m.quoted ? await conn.downloadMediaMessage(m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null) : await conn.downloadMediaMessage(m)
        const result = await wasticker.ConvertMedia(buffer, "video")
      
        return await conn.sendMessage(m.chat, { sticker: result, isAnimated: true }, { quoted: m })}
      } else {
        return await conn.sendMessage(m.chat, { text: "envia una imagen o video" }, { quoted: m })
      }
    }
}