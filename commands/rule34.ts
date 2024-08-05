
import { client } from "../core"
import { MessageSerialize } from "../types"
import { posts } from "../lib/functions/rule34"
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from "@whiskeysockets/baileys"
import { pickRandom } from "../lib/functions/functions"

export = {
    name: 'rule34',
    description: 'si existe...',
    groupOnly: true, 
    nsfw: true,
    async handle(conn: client, m: MessageSerialize, {prefix, args, isAdmin, isBotAdmin}) {
        try {
        try {
        if (!args.join('_')) return conn.sendMessage(m.chat, { text: 'debes escribir algo para buscar' }, { quoted: m })
        console.log(args.join('_'))
        const response = await posts({tags:[args.join('_')], pid: 1, limit: 100})
        const link = response.posts[Math.floor(Math.random() * 100)]
        let retry: number
        console.log(link)
        retry++
        if (link.tags_parsed.includes('1boy') || link.tags_parsed.includes('femboy') || link.tags_parsed.includes('male_only') || link.tags_parsed.includes('yaoi') || link.tags_parsed.includes('ilovementits') || link.tags_parsed.includes('gay') || link.tags_parsed.includes('futanari') || link.tags_parsed.includes('lesbian') || link.tags_parsed.includes('futa_on_male') || link.tags_parsed.includes('futa_on_femboy') || link.tags_parsed.includes('futa_on_gay') || link.tags_parsed.includes('male_focus') && retry < 3) {
            
    
            const buttons = [
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        display_text: "（囲唄コ）𝚛𝚎𝚒𝚗𝚝𝚎𝚗𝚝𝚊𝚛?",
                        id: '.rule34 ' + args.join('_'),
                    })
                }
            ]
    

            
    
            const dick = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: 'esta imagen contiene tags prohibidos/gays'
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: 'powered by @skidy89'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                               hasMediaAttachment: false
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
                
            }, { userJid: m.sender })
    
            await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
            return
        }

        
        if(link.file_url.endsWith(".mp4") || link.file_url.endsWith(".gif")){
            const sections = [
                {
                    title: "tags relacionados",
                    rows: link.tags_parsed.map(tag => ({
                        title: tag,
                        highlight_label: 'relacionado',
                        description: 'buscar tag de la imagen',
                        id: `.rule34 ${tag}`
                    }))
                }
            ]
            const buttons = [
                {
                    "name": "cta_url",
                    "buttonParamsJson": JSON.stringify({
                        display_text: "VER EN LA RULE34",
                        merchant_url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`,
                        url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`
                    })
                },
                {
                    "name": "single_select",
                    "buttonParamsJson": JSON.stringify({
                        title: "（押化な）𝚝𝚊𝚐𝚜 𝚜𝚒𝚖𝚒𝚕𝚊𝚛𝚎𝚜",
                        sections: sections
                    })
                }
            ]
            const idks = await prepareWAMessageMedia({
                video: {
                    url: link.file_url,
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
                                text: 'aqui tienes'
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: 'powered by @skidy89'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                               videoMessage: idks.videoMessage,
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
                
            }, { userJid: m.sender })
    
        await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
        }
        if (link.file_url.endsWith('.png') || link.file_url.endsWith('.jpeg') || link.file_url.endsWith('.jpg')) {
            const sections = [
                {
                    title: "tags relacionados",
                    rows: link.tags_parsed.map(tag => ({
                        title: tag,
                        highlight_label: 'relacionado',
                        description: 'buscar tag de la imagen',
                        id: `.rule34 ${tag}`
                    }))
                }
            ]
            const buttons = [
                {
                    "name": "cta_url",
                    "buttonParamsJson": JSON.stringify({
                        display_text: "VER EN RULE34",
                        merchant_url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`,
                        url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`
                    })
                },
                {
                    "name": "single_select",
                    "buttonParamsJson": JSON.stringify({
                        title: "（押化な）𝚝𝚊𝚐𝚜 𝚜𝚒𝚖𝚒𝚕𝚊𝚛𝚎𝚜",
                        sections: sections
                    })
                }
            ]
            const idks = await prepareWAMessageMedia({
                image: {
                    url: link.file_url,
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
                                text: 'aqui tienes'
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: 'powered by @skidy89'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                               imageMessage: idks.imageMessage,
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
                
            }, { userJid: m.sender })
    
        await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
        }} catch (e) {
            const response = await posts({tags:[args.join('_')], pid: 1, limit: 50})
            const link = response.posts[Math.floor(Math.random() * 25)]
            console.log(link)
        
            if(link.file_url.endsWith(".mp4") || link.file_url.endsWith(".gif")){
                const sections = [
                    {
                        title: "tags relacionados",
                        rows: link.tags_parsed.map(tag => ({
                            title: tag,
                            highlight_label: 'relacionado',
                            description: 'buscar tag de la imagen',
                            id: `.rule34 ${tag}`
                        }))
                    }
                ]
                const buttons = [
                    {
                        "name": "cta_url",
                        "buttonParamsJson": JSON.stringify({
                            display_text: "VER EN RULE34",
                            url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`,
                        })
                    },
                    {
                        "name": "single_select",
                        "buttonParamsJson": JSON.stringify({
                            title: "（押化な）𝚝𝚊𝚐𝚜 𝚜𝚒𝚖𝚒𝚕𝚊𝚛𝚎𝚜",
                            sections: sections
                        })
                    }
                ]
                const idks = await prepareWAMessageMedia({
                    video: {
                        url: link.file_url,
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
                                    text: 'aqui tienes'
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: 'powered by @skidy89'
                                }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                   videoMessage: idks.videoMessage,
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
                    
                }, { userJid: m.sender })
        
            await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
            }
            if (link.file_url.endsWith('.png') || link.file_url.endsWith('.jpeg') || link.file_url.endsWith('.jpg')) {
                const sections = [
                    {
                        title: "tags relacionados",
                        rows: link.tags_parsed.map(tag => ({
                            title: tag,
                            highlight_label: 'relacionado',
                            description: 'buscar tag de la imagen',
                            id: `.rule34 ${tag}`
                        }))
                    }
                ]
                const buttons = [
                    {
                        "name": "cta_url",
                        "buttonParamsJson": JSON.stringify({
                            display_text: "VER EN LA RULE34",
                            merchant_url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`,
                            url: `https://rule34.xxx/index.php?page=post&s=view&id=${link.id}`
                        })
                    },
                    {
                        "name": "single_select",
                        "buttonParamsJson": JSON.stringify({
                            title: "（押化な）𝚝𝚊𝚐𝚜 𝚜𝚒𝚖𝚒𝚕𝚊𝚛𝚎𝚜",
                            sections: sections
                        })
                    }
                ]
                const idks = await prepareWAMessageMedia({
                    image: {
                        url: link.file_url,
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
                                    text: 'aqui tienes'
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: 'powered by @skidy89'
                                }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                   imageMessage: idks.imageMessage,
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
                    
                }, { userJid: m.sender })
        
            await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
        }}} catch (e) {
           
            const buttons = [
                {
                    "name": "quick_reply",
                    "buttonParamsJson": JSON.stringify({
                        display_text: "(ユうー) 𝚛𝚊𝚗𝚍𝚘𝚖",
                        id: '.rule34 ' + pickRandom(['anime', 'lewd', 'furry', 'big_breasts']),
                    })
                }
            ]
    

            
    
            const dick = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: 'ɴᴏ ᴇɴᴄᴜᴇɴᴛʀᴏ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴄᴏɴ ᴇꜱᴛᴇ ᴛᴀɢ\nᴄᴀᴜꜱᴀꜱ:\n ᴇʟ ᴛᴀɢ ɴᴏ ᴇxɪꜱᴛᴇ ᴏ ɴᴏ ʜᴀʏ ɪᴍᴀɢᴇɴᴇꜱ ᴄᴏɴ ᴇꜱᴇ ᴛᴀɢ\nɪɴᴛᴇɴᴛᴀ ᴅᴇ ɴᴜᴇᴠᴏ\n ᴇᴊᴇᴍᴘʟᴏ: .ʀᴜʟᴇ34 ᴀɴɪᴍᴇ'
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: 'powered by @skidy89'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                               hasMediaAttachment: false
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
                
            }, { userJid: m.sender })
    
            await conn.relayMessage(m.chat, dick.message, { messageId: dick.key.id })
            console.log(e)
        }


          

    }}

