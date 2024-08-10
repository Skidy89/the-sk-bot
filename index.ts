import { cache, groupAdminsCache, loadCommands } from "./core/worker"
import pino, { Logger } from 'pino'
import { fetchLatestBaileysVersion, isJidBroadcast, proto } from '@whiskeySockets/baileys'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import { client } from "./core/"
import { DatabaseType, low } from "./types"
import { Low, JSONFile } from "@commonify/lowdb"
import { join } from "path"
import { chain } from 'lodash'
import { host, store } from "./lib/functions/functions"

const adpater = new JSONFile<DatabaseType>(join(__dirname, './database.json'))
globalThis.db = new Low(adpater) as low

setInterval(async () => {
    cache.clear()
    groupAdminsCache.clear()

}, 1000 * 60 * 60) // every hour


async function loadDatabase(): Promise<void> {
    while (globalThis.db.READ) await new Promise(resolve => setTimeout(resolve, 1000))
    if (globalThis.db.data !== null) return
    globalThis.db.READ = true
    await globalThis.db.read();
    (globalThis.db as low).READ = false
    globalThis.db.data = globalThis.db.data ?? {
        users: {},
        chats: {},
        settings: {},
        sticker: {},
    }
    globalThis.db.chain = chain(globalThis.db.data)
}
(async (): Promise<void> => {

await loadDatabase()

if (globalThis.db) {
    setInterval(async () => {
        if (globalThis.db.data) await globalThis.db.write()
    }, 30 * 1000)
}
    const logger: Logger = pino({ level: 'debug', stream: 'store' })

    const { version } = await fetchLatestBaileysVersion()
    const sock = new client()
    loadCommands()

    
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

    }, 'skid bot', true, false, null)


process.on('uncaughtException', function (err) {
        let e = String(err)
        if (e.includes("Socket connection timeout")) return
        if (e.includes("item-not-found")) return
        if (e.includes("rate-overlimit")) return
        if (e.includes("Connection Closed")) return
        if (e.includes("Timed Out")) return
        if (e.includes("Value not found")) return
        console.log(chalk.redBright.bold("[Client] ") + err)
    })
})()