import { client } from "../core";
import { commands, MessageSerialize, UserType } from "../types";


export = <commands>{
    name: "casino",
    description: "casino rpg",
    category: 'rpg',
    example: ".casino 100",
    handle: async (conn: client, m: MessageSerialize) => {
        let user = globalThis.db.data.users[m.sender] as UserType
        if (!m.args[0]) return await conn.sendMessage(m.chat, { text: "nesecitas un monto de dinero" }, { quoted: m })
        if (!parseInt(m.args[0])) return await conn.sendMessage(m.chat, { text: "el monto debe ser un numero" }, { quoted: m })
        if (user.money < parseInt(m.args[0])) return await conn.sendMessage(m.chat, { text: "no tienes esa cantidad de dinero" }, { quoted: m })
        const bot = user.especial === 'gambler' ? Math.max(Math.floor(Math.random() * 100) - user.luck, 0) : Math.floor(Math.random() * 100) + 1
        const gambler = user.especial === 'gambler' ? Math.floor(Math.random() * 100) + user.luck : Math.floor(Math.random() * 100) + 1
        if (bot < gambler) {
            user.money += parseInt(m.args[0])
            return await conn.sendMessage(m.chat, { text: `ganaste ${m.args[0]}$\ntu: ${gambler}\nbot: ${bot}` }, { quoted: m })
        }
        if (bot > gambler) {
            user.money -= parseInt(m.args[0])
            return await conn.sendMessage(m.chat, { text: `perdiste ${m.args[0]}$\ntu: ${gambler}\nbot: ${bot}` }, { quoted: m })
        }

        
    }
}