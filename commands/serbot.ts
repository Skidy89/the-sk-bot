
import { client, dataSessions } from "../core"
import { cached, commands, MessageSerialize } from "../types"
import {  fetchLatestBaileysVersion, isJidBroadcast, jidNormalizedUser, proto } from '@whiskeySockets/baileys'
import pino, { Logger } from "pino"

import { host, store } from "../lib/functions/functions"
import NodeCache from "node-cache"


export = <commands>{
    name: 'serbot',
    description: 'vuelvete serbot',
    category: 'serbot',
    example: '.serbot. o si prefieres .serbot --code',

    async handle(conn: client,  m: MessageSerialize) {
        if (conn.decodeJid(conn.user.id) !== globalThis.main) return m.reply('solo puedes ser un subbot desde el numero principal!!. wa.me/+' + globalThis.main.split('@')[0])
        const session = dataSessions.get(m.sender.split('@')[0])
        if (session) return m.reply('tu session ya esta activa')
        async function jadibot(conn: client,  m: MessageSerialize) {
        
            
        
        const logger: Logger = pino({ level: 'silent', stream: 'store' })
        const { version } = await fetchLatestBaileysVersion()
        const isPairingCode = m?.args[0]?.includes('--code') || m.args[0]?.includes('--code ') || m.args[0]?.includes('-code ') 
        const sock = new client()
        
        await sock.connect({
            printQRInTerminal: false,
            browser: ['skid bot', 'safari', 'chrome'],
            logger,
            waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
            version,
            msgRetryCounterCache: new NodeCache({ stdTTL: 0 }),
            mediaCache: new NodeCache({ stdTTL: 0 }),
            markOnlineOnConnect: false,
            syncFullHistory: false,
            linkPreviewImageThumbnailWidth: 1980,
            userDevicesCache: new NodeCache({ stdTTL: 0 }),
            shouldSyncHistoryMessage: (msg: proto.Message.IHistorySyncNotification) => false,
            generateHighQualityLinkPreview: true,
            shouldIgnoreJid: jid => isJidBroadcast(jid),
            customUploadHosts: host,
            defaultQueryTimeoutMs: 60000,
            patchMessageBeforeSending: async (message) => {
                let messages = 0
                sock.uploadPreKeysToServerIfRequired()
                messages++
                return message
            },
            getMessage: async (key: proto.IMessageKey) => {
                if (store) {
                    const message = await store.loadMessage(key.remoteJid, key.id)
                    return message?.message && undefined
                } else {
                    return undefined
                }
            },
    
        }, m.sender.split('@')[0], false, isPairingCode, m)
        

    }
    jadibot(conn, m)

       
        

        


    }
}