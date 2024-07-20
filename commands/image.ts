import { WebpToImage } from "../lib"

export = {
    name: 'toimage',
    description: 'Convertir sticker a imagen',
    async handle(conn, m) {
      if (m.type.includes("stickerMessage") || (m.quoted && m.quoted.type.includes("stickerMessage"))) {
      if (m.quoted.message.stickerMessage.isAnimated) conn.sendMessage(m.chat, { text: "No se pueden convertir stickers animados a imagen" }, { quoted: m })
      const buffer = await conn.downloadMediaMessage(m.quoted)

      const result = await WebpToImage(buffer)

      return await conn.sendMessage(m.chat, { image: result }, { quoted: m })
      } else {
        return await conn.sendMessage(m.chat, { text: "envia un sticker" }, { quoted: m })
      }
    }
}