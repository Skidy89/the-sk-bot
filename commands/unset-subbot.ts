import { client } from "../core";
import { commands, MessageSerialize, SettingType } from "../types";




export = <commands>{
    name: 'unset',
    description: 'elimina configuraciones de un subbot',
    category: 'serbot',
    example: '.unset',
    subbots: true,
    handle: async (conn: client, m: MessageSerialize) => {
        const settings: SettingType = globalThis.db.data.settings[conn.decodeJid(conn.user.id)]
        
        const text = `
aqui puedes eliminar tu configuracion de subbot
nombre: ${settings.botName || 'sin nombre agregado!!'}
imagenes agregadas": ${settings.menuImage.length > 0 ? settings.menuImage.length : 'sin imagenes!'}
url: ${settings.urlLinks || 'sin url agregada!!'}
normal: ${settings.legacyMenu ? 'legacy (modificable)' : 'normal (no modificable)'}
custom: ${settings.customMenu ? 'si' : 'no'}

comandos disponibles:
name: cambia el nombre del subbot
url: cambia la url del subbot (al enviar una advertencia de uso)
image: agrega una imagen
normal: cambia el menu para que sea normal
custom: elimina tu menu
`.trim()




switch (m.args[0]) {
    case 'image':
        if (settings.menuImage.length < 0) return conn.sendText(m.chat, 'no hay imagenes', m)
        delete settings.menuImage
        conn.sendText(m.chat, 'imagens eliminadas con exito!!', m)
    break
    case 'name':
        if (!settings.botName) return conn.sendText(m.chat, 'no has agregado un nombre ', m)
        delete settings.botName
        conn.sendText(m.chat, 'nombre eliminado con exito!!', m)
    break
    case 'url':
        if (!settings.urlLinks) return conn.sendText(m.chat, 'no has agregado una url ', m)
        delete settings.urlLinks
        conn.sendText(m.chat, 'url eliminada con exito!!', m)
    break
    case 'normal':
        if (!settings.legacyMenu) return conn.sendText(m.chat, 'no has cambiado el menu ', m)
        settings.legacyMenu = false
        conn.sendText(m.chat, 'menu cambiado con exito!!', m)
    break

    case 'custom':
        if (!settings.customMenu) return conn.sendText(m.chat, 'no has cambiado el menu ', m)
        delete settings.customMenu
        conn.sendText(m.chat, 'menu cambiado con exito!!', m)
    break
    default:
        conn.sendText(m.chat, text, m)
    }
    

}
}