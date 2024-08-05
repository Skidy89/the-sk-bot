import { client } from "../core/client"
import { Icommand } from "../core/worker"
import { MessageSerialize } from "../types/"
import { toZonedTime } from 'date-fns-tz'
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from "@whiskeysockets/baileys"
import { commands } from "../types"
import { getRandom, pickRandom, runtime } from "../lib/functions/functions"



export = {
    name: 'menu',
    description: 'menu de comandos',
    async handle(conn: client, m: MessageSerialize, { prefix }) {
        const commandMap = Icommand as Map<string, commands>
        const images = ['https://i.pinimg.com/564x/11/46/fe/1146fe6e189dc73761726e566dff8197.jpg','https://i.pinimg.com/564x/ef/41/75/ef4175b23ebf5e287c4750cf242fe41c.jpg', 'https://i.pinimg.com/564x/eb/0a/44/eb0a449b2b781f8f90ad8db0b654f500.jpg', 'https://i.pinimg.com/564x/49/23/1b/49231bb54cc8b0162a3ba2642364fa8f.jpg']
        const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
        const facts = ["toca el boton de abajo para ver los comandos", 'no tengo imaginacion', 'sabes que hacer', '/help', 'usa --help para ver el estado de un comando']
        let str =  `
╭────❏ *MENU* ❏
│
│ *bienvenido*
│ *@${m.sender.split("@")[0]}*
│
│ *${facts[Math.floor(Math.random() * facts.length)]}*
│
╰────────────────
`

        const sections = [
            {
                title: "Comandos",
                rows: Array.from(commandMap.values())
                .filter(cmd => !cmd.hide)
                .map((cmd) => ({
                    title: `${cmd.name}`,
                    description: cmd.description,
                    id: `${prefix}${cmd.name}`
                }))
            }
        ]

        const buttons = [
            {
                "name": "single_select",
                "buttonParamsJson": JSON.stringify({
                    title: "（陰液ホ）𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜",
                    sections: sections
                })
            },
            {
                "name": "cta_url",
                "buttonParamsJson": JSON.stringify({
                    display_text: "（位ぐワ） 𝚐𝚒𝚝𝚑𝚞𝚋",
                    merchant_url: `https://www.github.com/skidy89/the-sk-bot`,
                    url: `https://www.github.com/skidy89/the-sk-bot`,
                })
            },
        ]

        const image = await prepareWAMessageMedia({
            image: {
                url: pickRandom(images),
            }
        }, {
            upload: conn.waUploadToServer,
        })
        

        const dick = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: str
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: getTime('America/Mexico_City')
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            imageMessage: image.imageMessage,
                            hasMediaAttachment: true
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons
                        }),
                        contextInfo: {
                            mentionedJid: [m.sender],
                            
                        }
                    }),

                },
            },
            
        }, { userJid: m.sender, quoted:  fcontact})

        await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
    }
}

const timeOfDay = ['Buenos días ☀', 'Buenas tardes 🏝', 'Buenas noches 🌙']

function getTime(timeZone: string): string {
    const now = new Date()
    const zonedTime = toZonedTime(now, timeZone)
    const hour = zonedTime.getHours()

    return timeOfDay[Math.floor(hour / 8)]
}
