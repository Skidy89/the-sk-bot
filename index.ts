import { worker } from "./core/worker"
import { handle, welcomes } from "./handler"
import pino from 'pino'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, ConnectionState, makeInMemoryStore, jidNormalizedUser, isJidBroadcast, DisconnectReason, BufferJSON } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import { client, serialize } from "./core/"
import { Boom } from '@hapi/boom'
import { MessageSerialize } from "./types"
import { Low, JSONFile } from "@commonify/lowdb"
import { join } from "path"
import { chain } from 'lodash'
import { DatabaseType } from "./core/serialize"
import { store } from "./lib/functions/functions"
import { unlinkSync } from "fs"




const adpater = new JSONFile<DatabaseType>(join(__dirname, './database.json'))
const db = new Low(adpater)

global.db = db as Low<DatabaseType>
async function loadDatabase(): Promise<void> {
    if ((db as any).READ) {
        return new Promise((resolve) =>
            setInterval(function (this: NodeJS.Timeout) {
                if (!(db as any).READ) {
                    clearInterval(this)
                    resolve()
                }
            }, 1000)
        )
    }
    if (db.data !== null) return
    (db as any).READ = true
    await db.read();
    (db as any).READ = false
    db.data ||= {
        users: {},
        chats: {},
        settings: {},
        sticker: {},
    };
    (db as any).chain = chain(db.data)
}
loadDatabase()

if (db) {
    setInterval(async () => {
        if (db.data) await db.write()
    }, 30 * 1000)
}

(async (): Promise<void> => {
    const path = './auth'
    const logger: any = pino({ level: 'silent', stream: 'store' })
    const { saveCreds, state } = await useMultiFileAuthState(path)
    const { version } = await fetchLatestBaileysVersion()
    const sock = new client()
    let Worker = new worker()
    await Worker.loadCommands()
    async function reload() {


        let isInit
        await sock.connect({
            printQRInTerminal: true,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })) },
            logger: logger,
            browser: ['skid bot', 'safari', 'chrome'],
            version,
            msgRetryCounterCache: new NodeCache,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            shouldIgnoreJid: jid => isJidBroadcast(jid),
            patchMessageBeforeSending: async (msg) => {
                let messagesSent
                await sock.uploadPreKeysToServerIfRequired()
                messagesSent = messagesSent + 1
                return msg
            },
            getMessage: async (key) => {
                if (store) {
                    const jid = jidNormalizedUser(key.remoteJid)
                    const msg = await store.loadMessage(jid, key.id)
                    return msg?.message && undefined
                } return {
                    conversation: 'skid was here',
                }
            }
        })
        



        async function connect(up: ConnectionState) {
            const { connection, lastDisconnect, isNewLogin, qr } = up
            if (!isNewLogin) isInit = true
            switch (connection) {
                case 'close':
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
                    switch (reason) {
                        case 405:
                            await unlinkSync(path + '/creds.json')
                            console.log(chalk.yellowBright.bold("[Client] ") + 'hubo un error inesperado. reiniciando...')
                            await reload()
                            break
                        case DisconnectReason.timedOut:
                            console.log(chalk.yellowBright.bold("[Client] ") + 'hubo un error inesperado. reiniciando...')
                            await reload()
                        break
                        case DisconnectReason.connectionClosed:
                            console.log(chalk.redBright.bold("[Client] ") + 'conexion cerrada. reiniciando...')
                            await reload()
                            break
                        case DisconnectReason.badSession:
                            await console.log(chalk.redBright.bold("[Client] ") + `conexion invalida. reinicia para volver a iniciar sesion`)
                            await reload().catch((e) => { console.log(e)})
                            break
                        case DisconnectReason.loggedOut:
                            await console.log(chalk.redBright.bold("[Client] ") + 'conexion cerrada. posible cierre de sesion...')
                            break
                        case DisconnectReason.connectionLost:
                            console.log(chalk.redBright.bold("[Client] ") + 'conexion perdida...')
                            await reload()
                            break
                        case DisconnectReason.restartRequired:
                            console.log(chalk.redBright.bold("[Client] ") + 'reinicio requerido...')
                            await reload()
                            return
                        case DisconnectReason.forbidden: // ???
                            console.log(chalk.redBright.bold("[Client] ") + 'FORBIDDEN')
                            break
                        case DisconnectReason.connectionReplaced:
                            console.log(chalk.yellowBright.bold("[Client] ") + 'la conexion a sido remplazada.')
                            break
                        case DisconnectReason.multideviceMismatch:
                            await console.log(chalk.yellowBright.bold("[Client] ") + 'multidevice mismatch')
                            await process.exit()
                            break
                        case DisconnectReason.unavailableService:
                            console.log(chalk.redBright.bold("[Client] ") + 'unavailable')
                            break
                    }
                    break
                case 'connecting':
                    console.log(chalk.greenBright.bold("[Client] ") + 'Conectado...')
                break
                case 'open':
                    console.log(chalk.greenBright.bold("[Client] ") + 'Conectado... disfruta!!')
                    break
            }
        }

        sock.on('CB:connect', connect)
        sock.on('creds.update', saveCreds)
        sock.on('message.upsert', async (m) => {
            serialize
                .message(sock, m)
                .then((serialize: MessageSerialize) => {
                    handle(sock, serialize, Worker)
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