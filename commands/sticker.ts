import Sticker, { StickerTypes } from "wa-sticker-formatter"
import { client } from "../core"
import { MessageSerialize } from "../types"

  export = {
    name: 'sticker',
    aliases: ['s'],
    description: 'envía un sticker',
    category: 'convertidores',
    async handle(conn: client, m: MessageSerialize) {
      var args = m.body.trim().split(/\s+/).slice(1)
      
    if (m?.type === 'imageMessage' || m?.quoted?.type === 'imageMessage' || m?.quoted?.type === 'stickerMessage') {
      const media = m.quoted ? await m.quoted.download() : await m.download()
        let stickers
        if (args || args?.includes('--steal')) {
          stickers = new Sticker(media, {
            pack: m.args[1] || '（ゑドで）',
            author: m.args[2] || "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
          })
          const buffer = await stickers.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        } else if (args || args?.includes('--crop')) {
          stickers = new Sticker(media, {
            pack: '（ゑドで）',
            author: "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
            type: StickerTypes.CROPPED,
          })
          const buffer = await stickers.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        } else if (args || args?.includes('--round')) {
          stickers = new Sticker(media, {
            pack: '（ゑドで）',
            author: "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
            type: StickerTypes.ROUNDED,
          })
          const buffer = await stickers.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        } else if (args || args?.includes('--cicle')) {
          stickers = new Sticker(media, {
            pack: '（ゑドで）',
            author: "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
            type: StickerTypes.CROPPED,
          })
        const buffer = await stickers.toBuffer()
        return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        } else {
        stickers = new Sticker(media, {
          pack: '（ゑドで）',
          author: "ꜱᴋɪᴅʙᴏᴛ",
          categories: ['👋'],
        })
        const buffer = await stickers.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        }
      } else if (m?.type === 'videoMessage' || m?.quoted?.type === 'videoMessage') {
        const media = m.quoted ? await m.quoted.download() : await m.download()
        const duration = m.quoted ? m.quoted.message.videoMessage.seconds : m.message.videoMessage.seconds
        if (duration && !isNaN(duration) && duration > 10) conn.reply(m.chat, "la duracion del video es muy largo\n maximo 10 segundos", m)
        let sticker
        if (args || args?.includes('--steal')) {
          sticker = new Sticker(media, {
            pack: m.args[1] || '（ゑドで）',
            author: m.args[2] || "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
          })
          const buffer = await sticker.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        } else {
          sticker = new Sticker(media, {
            pack: '（ゑドで）',
            author: "ꜱᴋɪᴅʙᴏᴛ",
            categories: ['👋'],
          })
          const buffer = await sticker.toBuffer()
          return await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })}
      } else {
        let text = `
ʀᴇꜱᴘᴏɴᴅᴇ ᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴏ ᴠɪᴅᴇᴏ
        
ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴀᴅᴍɪᴛᴇ ᴅɪꜰᴇʀᴇɴᴛᴇꜱ ᴛɪᴘᴏꜱ ᴅᴇ ᴄᴏɴᴠᴇʀꜱɪᴏɴ:
- --steal [pack] [author] (universal)
- --crop (imagen)
- --round (imagen)
- --circle (imagen)
`
        return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
      }

      


    }
}
