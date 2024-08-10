import { client } from "../core";
import { msToTime, patchDamage } from "../lib/functions/functions";
import { commands, MessageSerialize, UserType } from "../types";


const cooldown = 300000;

export = <commands>{
    name: 'aventura',
    aliases: ['aventura', 'adventure'],
    description: 've a una aventura',
    category: 'rpg',
    handle: async (conn: client, m: MessageSerialize) => {
        const user = globalThis.db.data.users[m.sender] as UserType
        const currentTime = new Date().getTime()
        const timers = cooldown - (currentTime - user.lastAventure)
        const isWarrior = user.especial === 'warrior'
        const isGambler = user.especial === 'gambler'

        if (user.health < 25) {
            return m.reply('tu salud es muy baja, por favor, debes curarte para ir a una aventura')
        }

        if (timers > 0) {
            return m.reply(`tienes que esperar ${msToTime(timers)} para volver a usar el comando`)
        }

        user.lastAventure = currentTime;

        if (Math.random() < 0.5) {
            const reward = isWarrior ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 10) + 1
            const Idamage = patchDamage(Math.floor(Math.random() * 99) + 1, user.defense || 0)
            user.health -= Idamage;
            user.exp += reward;

            conn.sendText(m.chat, `La aventura fue peligrosa, has perdido ${Idamage} salud y has ganado ${reward} exp`, m)
        } else {
            const money = isGambler ? Math.floor(Math.random() * 50) + 1 + user.luck : Math.floor(Math.random() * 10) + 1
            const reward = isWarrior ? Math.floor(Math.random() * 40) + 1 : Math.floor(Math.random() * 30) + 1
            user.exp += reward
            user.money += money

            conn.sendText(m.chat, `La aventura fue exitosa, has ganado ${money} dólares`, m)
        }
    }
}
