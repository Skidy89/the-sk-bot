import { client } from "../core";
import { expToLevelUp } from "../core/serialize";
import { commands, MessageSerialize, UserType } from "../types";

export = <commands>{
    name: 'perfil',
    description: 'muestra tu perfil',
    category: 'info',
    handle: async (conn: client, m: MessageSerialize) => {
        let pp = await conn.profilePictureUrl(m.sender, 'image').catch(error => {return 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg'})
        const user = globalThis.db.data.users[m.sender] as UserType
        
        const text = `
perfil de @${m.sender.split('@')[0]}
salud: ${user.health} ❤
dinero: $${user.money} 🤑
muertes: ${user.deaths} 💀

exp: ${user.exp}/${expToLevelUp(user.level)}
nivel: ${user.level}

personaje: ${user.especial}

`
        conn.sendImage(m.chat, pp, text, m, { mentions: [m.sender] })

    }
}