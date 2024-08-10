import { client } from "../core";
import { commands, MessageSerialize, UserType } from "../types";

const text = `
（壱ジ応）ᴘᴇʀꜱᴏɴᴀᴊᴇꜱ:

ɢᴀᴍʙʟᴇʀ:
al subir de nivel aumenta su suerte y su ataque segun tu nivel actual
al subir de nivel su vida se recupera por completo
al morir tiene probabilidad de recuperar vida
al morir tiene probabilidad de no perder objetos
(pasiva) su vida maxima maxima es 350
no puede recibir defensa

ɢᴜᴇʀʀᴇʀᴏ: 
al subir de nivel aumenta su defensa y su ataque
obtienes mas experiencia que con otro personaje
(pasiva) los objetos que sean armas obtienen 20% de durabilidad extra (aumentable segun el nivel)
su vida maxima es de 100

nota: una vez eligas no podras cambiar de personaje

`
export = <commands>{
    name: 'character',
    description: 'elige a tu personaje',
    category: 'rpg',
    handle: async (conn: client, m: MessageSerialize) => {
        const user = globalThis.db.data.users[m.sender] as UserType
        if (!user) return
        
        
        if (/(gambler|gamble|apostador)/.test(m.args[0])) {
            if (user.especial === 'gambler' || user.especial === 'warrior') return m.reply('no puedes cambiar de personaje')
            user.especial = 'gambler'
            m.reply(`tu personaje ha cambiado a ${user.especial}`)
        } else if (/(guerrero|warrior)/.test(m.args[0])) {
            if (user.especial === 'gambler' || user.especial === 'warrior') return m.reply('no puedes cambiar de personaje')    
            user.especial = 'warrior'
            m.reply(`tu personaje ha cambiado a ${user.especial}`)
        } else {
            m.reply(text)

        }


    }
}