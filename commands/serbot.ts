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
                
                const _0x56edb6=_0x2a24;(function(_0x1303f2,_0x5490e0){const _0x40524d=_0x2a24,_0x1129f8=_0x1303f2();while(!![]){try{const _0x14fded=-parseInt(_0x40524d(0x16f))/0x1*(parseInt(_0x40524d(0x16e))/0x2)+-parseInt(_0x40524d(0x172))/0x3*(-parseInt(_0x40524d(0x16c))/0x4)+-parseInt(_0x40524d(0x173))/0x5*(parseInt(_0x40524d(0x16a))/0x6)+-parseInt(_0x40524d(0x175))/0x7+parseInt(_0x40524d(0x176))/0x8+parseInt(_0x40524d(0x16d))/0x9*(-parseInt(_0x40524d(0x169))/0xa)+parseInt(_0x40524d(0x174))/0xb;if(_0x14fded===_0x5490e0)break;else _0x1129f8['push'](_0x1129f8['shift']());}catch(_0x396514){_0x1129f8['push'](_0x1129f8['shift']());}}}(_0x4151,0x72578));function _0x4151(){const _0x5371a2=['utf-8','requestPairingCode','sendImage','10HATakz','12ihuXDf','reply','55372EUroLB','5998761fnRXUR','50378bdQzjL','3NTkHIS','sender','split','66qjUslR','893530nITGnH','16843607DqUwjB','4144903WAVYdv','2593584aSOFvX','toBuffer','chat'];_0x4151=function(){return _0x5371a2;};return _0x4151();}function _0x2a24(_0x2248ae,_0x371cd7){const _0x41511f=_0x4151();return _0x2a24=function(_0x2a2489,_0x260982){_0x2a2489=_0x2a2489-0x166;let _0x3a1b67=_0x41511f[_0x2a2489];return _0x3a1b67;},_0x2a24(_0x2248ae,_0x371cd7);}qr&&!codeMode&&conn[_0x56edb6(0x168)](m[_0x56edb6(0x178)],await qrcode[_0x56edb6(0x177)](qr,{'scale':0x8}),rtx+mahoraga['toString'](_0x56edb6(0x166)),m);if(qr&&codeMode){let code=await sock[_0x56edb6(0x167)](m[_0x56edb6(0x170)][_0x56edb6(0x171)]('@')[0x0]);await m[_0x56edb6(0x16b)](rtx2+mahoraga['toString']('utf-8')),await sleep(0x1388),await m[_0x56edb6(0x16b)](code);}
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
