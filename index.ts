import { worker } from "./core/worker"
import { handle } from "./handler"
import pino from 'pino'
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, ConnectionState, makeInMemoryStore, makeCacheManagerAuthState } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import chalk from 'chalk'
import { client, serialize } from "./core/"
import { Boom } from '@hapi/boom'
import { unlinkSync} from "fs"
import { MessageSerialize } from "./types"
import { Low, JSONFile } from "@commonify/lowdb"
import { join } from "path"
import { chain } from 'lodash'
import { DatabaseType } from "./core/serialize"


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
console.info = () => {}
const store = makeInMemoryStore({ logger })


let sock = new client()
let Worker = new worker()
await Worker.loadCommands()


async function reload() {

let isInit = true
await sock.connect({
    printQRInTerminal: true,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })) },
    logger: logger,
    browser: ['skid bot', 'safari', 'chrome'],
    version,
    msgRetryCounterCache: new NodeCache,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
        if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message && undefined
        } return {
        conversation: 'skid was here',
        }}
    })
    store.bind(sock as any)


    
        async function connect(up: ConnectionState) {
            const { connection, lastDisconnect, isNewLogin, qr } = up
            if (!isNewLogin) isInit = true
            switch (connection) {
                case 'close':
                let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            switch (reason) {
                case 405:
                    await unlinkSync(path + 'creds.json')
                    console.log(chalk.yellowBright.bold("[Client] ") + 'hubo un error inesperado. reiniciando...')
                    await process.exit()
                break
                case 428:
                    await console.log(chalk.redBright.bold("[Client] ") + 'conexion cerrada. reiniciando...')
                    await reload()
                break
                case 500:
                    unlinkSync(path + 'creds.json')
                    await console.log(chalk.redBright.bold("[Client] ") + `conexion invalida. reinicia para volver a iniciar sesion`)      
                break
                case 401:
                    await console.log(chalk.redBright.bold("[Client] ") + 'conexion cerrada. posible cierre de sesion...')

                break
                case 408:
                    await console.log(chalk.redBright.bold("[Client] ") + 'conexion perdida...')
                    await reload()
                break
                case 515:
                    await console.log(chalk.redBright.bold("[Client] ") + 'reinicio requerido...')
                    await reload()
                return
                case 403: // ???
                    await console.log(chalk.redBright.bold("[Client] ") + 'FORBIDDEN')
                break
                case 408:
                    await console.log(chalk.yellowBright.bold("[Client] ") + 'la conexion a caducado. reiniciando')
                    await reload()
                break
                case 440:
                    await console.log(chalk.yellowBright.bold("[Client] ") + 'la conexion a sido remplazada.')
                break
                case 411:
                    await console.log(chalk.yellowBright.bold("[Client] ") + 'multidevice mismatch')
                    await process.exit()
                break
                case 503:
                    console.log(chalk.redBright.bold("[Client] ") + 'unavailable')
                break
                default:
                
                break
            }
                break
               
                case 'open':
                    console.log(chalk.greenBright.bold("[Client] ") + 'Conectado... disfruta!!')
                break
            }}
           
    

    sock.on('CB:connect', connect)
    sock.on('message.upsert', async (message) => {
        serialize
        .message(sock, message)
        .then((serialize: MessageSerialize) => {
            handle(sock, serialize, Worker)
        })
    })
    sock.on('creds.update', saveCreds)
}

await reload()

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