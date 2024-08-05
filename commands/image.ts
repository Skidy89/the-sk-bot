import { client } from "../core"
import {toImage} from "../lib"
import { MessageSerialize } from "../types"

export = {
    name: 'toimage',
    description: 'Convertir sticker a imagen',
    category: 'convertidores',
    async handle(conn: client, m: MessageSerialize) {
      if (!m.quoted) return await conn.sendMessage(m.chat, { text: 'envia un sticker' }, { quoted: m })
      if (m.quoted.type === ("stickerMessage")) {
        const media = await conn.downloadMediaMessage(m.quoted)
        const result = await toImage(media)
        return await conn.sendMessage(m.chat, { image: result }, { quoted: m })
      } else {
        return await conn.sendMessage(m.chat, { text: 'envia un sticker' }, { quoted: m })
      }
    }
}