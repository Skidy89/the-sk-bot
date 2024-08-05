import { generateWAMessageFromContent } from "@whiskeysockets/baileys"
import { MessageSerialize } from "../types/"
import { client } from "../core/client"

export = {
    name: `fake`,
    description: `envia un mensaje falso`,
    groupOnly: true,
    example: `.fake @tag | text1 | text2`,
    async handle(conn: client, m: MessageSerialize) {
        var text = m.body.substring(m.body.indexOf(" ") + 1)
        let tag = text.split("|")[0]
        let text1 = text.split("|")[1]
        let text2 = text.split("|")[2] 
        const str = `ᴜꜱᴏ ᴄᴏʀʀᴇᴄᴛᴏ
.fake @0 | hola | whatsapp?
>(puedes mencionar a alguien. el mensaje falso, el mensaje real)`

        if (!tag.startsWith('@') ||!tag || !text1 || !text2) return conn.sendMessage(m.chat, { text: str, mentions: ['0@s.whatsapp.net', m.sender] }, { quoted: m })
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