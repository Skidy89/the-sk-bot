import { client } from "../core";
import { convertSecToTime, msToTime, patchDamage, pickRandom } from "../lib/functions/functions";
import { commands, MessageSerialize, UserType } from "../types";




export = <commands>{
    name: 'aventura',
    aliases: ['aventura', 'adventure'],
    description: 've a una aventura',
    category: 'rpg',
    handle: async (conn: client, m: MessageSerialize) => {
        const user = globalThis.db.data.users[m.sender] as UserType
        let cooldown = 300000
        const damage = Math.floor(Math.random() * 99) + 1
        let timers = (cooldown - (new Date().getTime() - user.lastAventure))
        if (user.health < 25) return m.reply('tu salud es muy baja, por favor, debes curarte para ir a una aventura')
        if (timers > 0) return m.reply(`tienes que esperar ${msToTime(timers)} para volver a usar el comando`)
        user.lastAventure = new Date().getTime()

        if (Math.random() < 0.5) {
            let reward = user.especial === 'warrior' ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 10) + 1
            let Idamage = patchDamage(damage, user.defense ? user.defense : 0)
            user.health -= Idamage
            user.exp += reward
            user.lastAventure = new Date().getTime() * 1
            
            conn.sendText(m.chat, `La aventura fue peligrosa, has perdido ${Idamage} salud y has ganado ${reward} exp`, m)
        } else {
        const money = user.especial === 'gambler' ? Math.floor(Math.random() * 50) + 1 + user.luck : Math.floor(Math.random() * 10) + 1
        user.lastAventure = new Date().getTime() * 1
        user.money += money

        conn.sendText(m.chat, `La aventura fue exitosa, has ganado ${money} dolares`, m)
        }


    }

}