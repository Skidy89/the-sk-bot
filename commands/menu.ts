import { client } from "../core/client"
import { Icommand } from "../core/worker"
import { MessageSerialize, SettingType } from "../types/"
import { toZonedTime } from 'date-fns-tz'
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeySockets/baileys'
import { commands } from "../types"
import { getRandom, pickRandom, runtime } from "../lib/functions/functions"
const images = ['https://i.pinimg.com/564x/11/46/fe/1146fe6e189dc73761726e566dff8197.jpg','https://i.pinimg.com/564x/ef/41/75/ef4175b23ebf5e287c4750cf242fe41c.jpg', 'https://i.pinimg.com/564x/eb/0a/44/eb0a449b2b781f8f90ad8db0b654f500.jpg', 'https://i.pinimg.com/564x/49/23/1b/49231bb54cc8b0162a3ba2642364fa8f.jpg', 'https://i.pinimg.com/564x/11/85/e4/1185e4531c367b3fd144c35654262202.jpg']
const fcontact = {
    'key': {
        'participants': '0@s.whatsapp.net',
        'remoteJid': 'status@broadcast',
        'fromMe': false,
        'id': getRandom(23)
    },
    'message': {
        'contactMessage': {
            'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid={WAID}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
    },
    'participant': '0@s.whatsapp.net'
}
const facts = [
    "toca el boton de abajo para ver los comandos",
    'no tengo imaginacion',
    'sabes que hacer',
    '/help',
    'usa --help para ver el estado de un comando'
]
const placeholderMap = new Map<string, (m: MessageSerialize, conn: client) => string>([
    ['@tag', (m) => `@${m.sender.split("@")[0]}`],
    ['@getTime', () => getTime('America/Mexico_City')],
    ['@commands', () => getCommands()]
])
const IcommandMap = Array.from(Icommand.values()).filter(cmd => !cmd.hide)
const commandMap = Icommand as Map<string, commands>



const ilegacyMap = IcommandMap.reduce((acc, cmd) => {
    acc[cmd.category] = acc[cmd.category] || [];
    acc[cmd.category].push(`*${cmd.name}* - ${cmd.description}`);
    return acc;
}, {})

export = <commands>{
    name: 'menu',
    description: 'menu de comandos',
    hide: true,
    async handle(conn: client, m: MessageSerialize, { prefix }) {
        const settings: SettingType = globalThis.db?.data?.settings[conn.decodeJid(conn.user.id)]
        const waid = m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0];
        fcontact.message.contactMessage.vcard = fcontact.message.contactMessage.vcard.replace(/{WAID}/g, waid)
       

        if (!settings.legacyMenu) {
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
const sections = IcommandMap.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
        acc[cmd.category] = {
            title: `${cmd.category}`,
            rows: []
        };
    }
    acc[cmd.category].rows.push({
        title: `${cmd.name}`,
        description: cmd.description,
        id: `${prefix}${cmd.name}`
    });
    return acc;
}, {})


const sectionArray = Object.values(sections);


        const buttons = [
            {
                "name": "single_select",
                "buttonParamsJson": JSON.stringify({
                    title: "（陰液ホ）𝚌𝚘𝚖𝚊𝚗𝚍𝚘𝚜",
                    sections: sectionArray
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
                url: settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(images),
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
    } else {
        
        let text = `
╭────❏ *MENU* ❏
│
│ *bienvenido*
│ *@${m.sender.split("@")[0]}*
│
│ *${facts[Math.floor(Math.random() * facts.length)]}*
│
╰────────────────

`
        text += getCommands()
        if (settings.customMenu) {
            for (const [placeholder, replacer] of placeholderMap) {
                text = settings.customMenu.replace(new RegExp(placeholder, 'g'), replacer(m, conn));
            }
        }
        
        await conn.sendMessage(m.chat, { image: { url: settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(images) }, caption: text, mentions: [m.sender]}, { quoted: fcontact })
    }

    }
}

const timeOfDay = ['Buenos días ☀', 'Buenas tardes 🏝', 'Buenas noches 🌙']

function getTime(timeZone: string): string {
    const now = new Date()
    const zonedTime = toZonedTime(now, timeZone)
    const hour = zonedTime.getHours()

    return timeOfDay[Math.floor(hour / 8)]
}
function getCommands() {
    let text = '';

    for (const [category, commands] of Object.entries(ilegacyMap)) {
        text += `
╭───❏ *${category}* ❏
│
│ ${(commands as string[]).join('\n│ ')}
╰────────────────
`;
    }

    return text.trim()
}