import qrcode from 'qrcode'
import { client, serialize, worker } from "../core"
import { MessageSerialize } from "../types"
import { ConnectionState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { join } from 'path'
import pino from 'pino'
import NodeCache from 'node-cache'
import { sleep } from '../lib/functions/functions'
import { Boom } from '@hapi/boom'
import { unlinkSync } from 'fs'
import { handle } from '../handler'
import { format } from 'util'


const mahoraga = Buffer.from('Y3JlYWRvIHBvciBza2lkeTg5ISE', 'base64')
let rtx = `
🌟 Escanea este QR 🌟
para convertirte en
un bot temporal

1️⃣ Haz clic en los tres puntos en la esquina superior derecha
2️⃣ Toca WhatsApp Web
3️⃣ Escanea este QR

* El QR expira en 30 segundos *

_*Por favor evita usar tu numero principal para esto ⚠*_
`
let rtx2 = `
🔗 Usa este código 🔗
para convertirte en
un bot temporal

1️⃣ Haz clic en los tres puntos en la esquina superior derecha
2️⃣ Toca WhatsApp Web
3️⃣ Da clic en "Vincular con código de teléfono"
4️⃣ Pega el código a continuación

_*Por favor evita usar tu numero principal para esto ⚠*_`

export = {
    name: `serbot`,
    description: `convierte en subbot (beta)`,
    usage: '--code para obtener la sesion por codigo.\n--setname para ponerle un nombre personalizado.',
    groupOnly: true,
    async handle (conn: client, m: MessageSerialize, Worker: worker) {
        try {
        async function jadibots() {
            
            const folderPath = join(__dirname, `./jadibot/${m.sender.split("@")[0]}`)
            const logger: any = pino({ level: 'silent' })
            const { state, saveCreds } = await useMultiFileAuthState(folderPath)
            let sock = new client()
            console.info = () => {} 
            let { version } = await fetchLatestBaileysVersion()
            var args = m.body.trim().split(/\s+/).slice(1)
            const codeMode = args[0] && args[0].includes("--code")
            const nameMode = args[0] && args[0].includes("--setname")
            
            

            sock.connect({
                printQRInTerminal: false,
                logger,
                auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
                version,
                msgRetryCounterCache: new NodeCache,
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: true,
                defaultQueryTimeoutMs: undefined,
                browser: codeMode ? ['Chrome (Linux)','',''] : ['SkidBot', 'Safari', '1.0.0'], 
            })
            let isInit = false
            async function connect(up: ConnectionState) {
                const { connection, qr, lastDisconnect, isNewLogin } = up
                if(!isNewLogin) isInit = false
                
                if(qr && !codeMode) {
                    conn.sendImage(m.chat, await qrcode.toBuffer(qr, { 'scale': 8 }), rtx + mahoraga.toString('utf-8'), m)
                }
                if(qr && codeMode) {
                    let code = await sock.requestPairingCode(m.sender.split('@')[0])
                    await m.reply(rtx2 + mahoraga.toString('utf-8'))
                    await sleep(5000)
                    await m.reply(code)
                }
                switch (connection) {
                    case 'close':
                    delete Worker.socket[m.sender]
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
                switch (reason) {
                    case 405:
                        if (folderPath) unlinkSync(folderPath + '/creds.json')
                        return await m.reply(`*❗ Reenvia el comando*`)

                    case 428:
                        return m.reply(`*❌ algo fallo en la conexion`) 
                    case 500:
                        return await m.reply(`*❌ Tu conexion es invalida*\n*no se te reconectara*`)
                    case 401:
                        return m.reply(`*❌ Dispositivo desconectado*\n\n*Tendras que volver a iniciar sesion*`) 
                    case 408:
                        jadibots()
                        return m.reply(`*❗ se agoto el tiempo de conexión...*`)
                    case 515:
                        jadibots()
                    return m.reply(`*⚠️ Reinicio requerido,*\n*Reiniciando...*`) 
                    case 403: // ???
                        return m.reply('*❌ el servidor de whatsapp tiene un error*\n*403: forbidden*')
                    case 408:
                        jadibots()
                        return await m.reply(`*❗ Conexion perdida del servidor*\n*reconexion Forzada*`)
                    case 440:
                        return await m.reply(`*❗ Conexion remplazada*`)
                    case 411:
                        return await m.reply(`*❗ hubo un error en la sesion multidevice*`)
                    case 503:
                        return m.reply('*❌ el servidor de whatsapp tiene un error*\n*503: unavailableService*')

                   
                }
                    break
                   
                    case 'open':
                        
                        
                        global.subbot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
                        if (nameMode && global.subbot) {
                            Worker.socket.set(m.sender, {
                                isInit: isInit,
                                botname: args[1] ? args[1] : m.pushname,
                                uptime: Date.now(),
                                sockets: sock
                            })
                            return m.reply('hecho')
                        } else {
                            Worker.socket.set(m.sender, {
                                isInit: isInit,
                                botname: 'skibidi sigma',
                                uptime: Date.now(),
                                sockets: sock
                            })
                        }
                        console.log(format(Worker.socket[m.sender]))
                        return m.reply("✔ conectado: recuerda que esto es una beta. todo esta sujeto a cambios\ntu bot es llamado como " + global.db.data.settings[sock.user.id.split(':')[0] + '@s.whatsapp.net'].botname + " puedes cambiar esto usando --setname en tu proxima sesion")
                }     
            }
            setInterval(async () => { 
                const socket = Worker.socket.get(m.sender)
                if (!socket.sockets.user) { 
                  try { socket.sockets.ws.close() } catch { } 
                  socket.sockets.removeAllListeners()
                  delete Worker.socket[m.sender]
                }}, 60000)
                sock.on('CB:connect', connect.bind(sock))
                sock.on('message.upsert', async (message) => {
                    serialize
                    .message(sock, message)
                    .then((serialize: MessageSerialize) => {
                        handle(sock, serialize, Worker)
                    })
                })
            sock.on('creds.update', saveCreds)
            
        }
        await jadibots() 
    } catch (e) {
        console.log(e)
    }
    }}