import { loadCommands } from "./core/worker"
import { handle, welcomes } from "./handler"
import pino, { Logger } from 'pino'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, ConnectionState, makeInMemoryStore, jidNormalizedUser, isJidBroadcast, DisconnectReason, BufferJSON, WACallEvent, proto } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import { client, serialize } from "./core/"
import { Boom } from '@hapi/boom'
import { DatabaseType, low, MessageSerialize } from "./types"
import { Low, JSONFile } from "@commonify/lowdb"
import { join } from "path"
import { chain } from 'lodash'
import { host, store } from "./lib/functions/functions"







const adpater = new JSONFile<DatabaseType>(join(__dirname, './database.json'))
globalThis.db = new Low(adpater) as low




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
    };
    globalThis.db.chain = chain(globalThis.db.data)
}

loadDatabase()

if (globalThis.db) {
    setInterval(async () => {
        if (globalThis.db.data) await globalThis.db.write()
    }, 30 * 1000)
}

(async (): Promise<void> => {
    const path = './auth'
    const logger: Logger = pino({ level: 'debug', stream: 'store' })
    const { saveCreds, state } = await useMultiFileAuthState(path)
    const { version } = await fetchLatestBaileysVersion()
    const sock = new client()
    
    loadCommands()
    
    async function reload() {


        let isInit
        await sock.connect({
            printQRInTerminal: true,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })) },
            logger: logger,
            browser: ['skid bot', 'safari', 'chrome'],
            waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
            version,
            msgRetryCounterCache: new NodeCache,
            mediaCache: new NodeCache({ stdTTL: 0 }),
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            shouldIgnoreJid: jid => isJidBroadcast(jid),
            customUploadHosts: host,
            getMessage: async (key) => {
                if (store) {
                    const jid = jidNormalizedUser(key.remoteJid)
                    const msg = await store.loadMessage(jid, key.id)
                    return msg?.message && undefined
                } return {
                    conversation: 'skid was here',
                }
            },
        })
        async function idk(fuck: WACallEvent): Promise<proto.IWebMessageInfo> {
            let fuckers: Map<string, number> = new Map()
            let warns = 2

            
            switch (fuck.status) {
                case 'offer':
                    let text = `*lo siento @${fuck.from.split('@')[0]} pero no puedo recibir ${fuck.isVideo ? 'videollamadas' : 'llamadas'}*`
                    await sock.rejectCall(fuck.id, fuck.from)
                    return sock.sendText(fuck.from, text, null, { mentions: [ fuck.from ] })
            }
        }

        async function connect(up: ConnectionState) {
            const { connection, lastDisconnect, isNewLogin, qr } = up
            if (!isNewLogin) isInit = false

            if (connection == 'open') {
                isInit = true
                console.log(`${chalk.greenBright('[Client]')} conectado`)
                
            }
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
                    if (connection === 'close') {
                        if (reason === DisconnectReason.badSession) {
                            console.log(`${chalk.redBright('[Client]')} conexion erronea del websocket...`)

                        } else if (reason === DisconnectReason.connectionClosed) {
                            console.log(`${chalk.redBright('[Client]')} cerrando...`)
                            await reload().catch(console.error)
                        } else if (reason === DisconnectReason.connectionLost) {
                            console.log(`${chalk.yellowBright('[Client]')} conexion perdida del websocket...`)
                            await reload().catch(console.error)
                        } else if (reason === DisconnectReason.connectionReplaced) {
                            console.log(`${chalk.yellowBright('[Client]')} connection replaced...`)

                        } else if (reason === DisconnectReason.loggedOut) {
                            console.log(`${chalk.yellowBright('[Client]')} sesion cerrada...`)

                        } else if (reason === DisconnectReason.restartRequired) {
                            console.log(`${chalk.yellowBright('[Client]')} reinicio requerido...`)
                            await reload().catch(console.error)
                        } else if (reason === DisconnectReason.timedOut) {
                            console.log(`${chalk.yellowBright('[Client]')} tiempo agotado...`)
                            await reload().catch(console.error)
                        } else {
                            console.log(`${chalk.yellowBright('[Client]')} reinicio requerido...`)
                            await reload().catch(console.error)
                        }
                    }
                    
        }
        sock.on('call', idk)
        sock.on('CB:connect', connect)
        sock.on('creds.update', saveCreds)
        sock.on('message.upsert', async (m) => {
            serialize
                .message(sock, m)
                .then((serialize: MessageSerialize) => {
                    handle(sock, serialize)
        })})
        sock.on('group.update', async (m) => {
            welcomes(sock, m)
        })


    }

    await reload().catch((e) => console.log(chalk.redBright.bold("[Client] ") + e))

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