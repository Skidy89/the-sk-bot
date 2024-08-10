import { client } from "../core";
import { telegraPh } from "../lib";
import { commands, MessageSerialize, SettingType } from "../types";

let addcustom = new Map<string, boolean>()
let customMenuText = `
❗ vuelve a usar el comando .set para agregar el menu personalizado
@tag - mencionar al usuario
@getTime - un saludo dependiendo de la hora
@commands - mostrar todos los comandos en categorias

ejemplo:
hola @tag este es skid bot
@commands

`
export = <commands>{
    name: 'set',
    description: 'configura el subbot',
    category: 'serbot',
    example: '.set',
    subbots: true,
    handle: async (conn: client, m: MessageSerialize) => {
        const settings: SettingType = globalThis.db.data.settings[conn.decodeJid(conn.user.id)]
        const text = `
aqui puedes configurar el subbot
nombre: ${settings.botName || 'sin nombre agregado!!'}

imagenes agregadas": ${settings.menuImage.length > 0 ? settings.menuImage.length : 'sin imagenes!'}
url: ${settings.urlLinks || 'sin url agregada!!'}
estilo de menu: ${settings.legacyMenu ? 'legacy (modificable)' : 'normal (no modificable)'}
custom menu: ${settings.customMenu ? 'si' : 'no'}


comandos disponibles:
name: cambia el nombre del subbot
url: cambia la url del subbot (al enviar una advertencia de uso)
image: agrega una imagen
legacy: cambia el menu para que sea personalizado
custom: poner tu propio menu!!
`.trim()





switch (m.args[0]) {
    case 'image':
    if (settings.menuImage.length >= 10) return conn.sendText(m.chat, 'ya alcanzaste el limite de imagenes', m)
    if (m?.type === 'imageMessage' || m?.quoted?.type === 'imageMessage' || m?.type === 'stickerMessage' || m?.quoted?.type === 'stickerMessage') {
        const media = m.quoted ? await conn.downloadAndSaveMediaMessage(m.quoted) : await conn.downloadAndSaveMediaMessage(m)
        const url = await telegraPh(media)
        settings.menuImage.push(url)

        conn.sendText(m.chat, 'imagen agregada con exito!!', m)
    }
    break
    case 'name':
        if (!m.args[1]) return conn.sendText(m.chat, 'escribe el nombre para el subbot', m)
        settings.botName = m.args[1]
        conn.sendText(m.chat, 'nombre cambiado con exito!!', m)
    break
    case 'url':
        if (!m.args[1]) return conn.sendText(m.chat, 'escribe la url para el subbot', m)
        settings.urlLinks = m.args[1]
        conn.sendText(m.chat, 'url cambiada con exito!!', m)
    break
    case 'legacy':
    if (settings.legacyMenu) return conn.sendText(m.chat, 'el menu ya es legacy', m)
    settings.legacyMenu = true
    conn.sendText(m.chat, 'menu legacy cambiado con exito!!', m)
    break
    case 'custom':
    if (settings.customMenu) return conn.sendText(m.chat, 'elimina tu menu para crear uno nuevo', m)
    addcustom.set(m.sender, true)
    conn.sendText(m.chat, customMenuText, m)
    break

    default:
        if (addcustom.get(m.sender)) {
            settings.customMenu = m.args.join(' ')
            conn.sendText(m.chat, 'menu personalizado agregado con exito!!', m)
            addcustom.delete(m.sender)
        } else {
        conn.sendText(m.chat, text, m)
    }
    }
    

}
}