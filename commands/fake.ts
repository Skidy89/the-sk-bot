import { generateWAMessageFromContent } from "@whiskeysockets/baileys"
import { MessageSerialize } from "../types/messages"
import { client } from "../core/client"

export = {
    name: `fake`,
    description: `envia un mensaje falso`,
    groupOnly: true,
    async handle(conn: client, m: MessageSerialize) {
        var text = m.body.substring(m.body.indexOf(" ") + 1)
        let tag = text.split("|")[0] // Target Jid
        let text1 = text.split("|")[1] // Target Text
        let text2 = text.split("|")[2] // Your Text
        const str = 'por favor menciona a alguien y escribe un mensaje\nejemplo: .fake @0|wsp|hey wsp'
        if (!tag.startsWith('@')) return conn.sendMessage(m.chat, { text: "mencionalo con @" }, { quoted: m })
        if (!tag || !text1 || !text2) return conn.sendMessage(m.chat, { text: str }, { quoted: m })
        tag = tag.replace("@", "").replace(" ", "") + "@s.whatsapp.net"
            const message = generateWAMessageFromContent(m.chat, {
                extendedTextMessage: {
                    text: text2,
                    contextInfo: {
                        participant: tag,
                        quotedMessage: {
                            extendedTextMessage: {
                                text: text.split("|")[1],
                            },
                        },
                    },
                },
            },
            {
                userJid: tag,
            }
        )
        await conn.relayMessage(m.chat, message.message, {
            messageId: message.key.id,
        })

    }
}