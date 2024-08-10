
import { client } from "../core";
import { commands, MessageSerialize } from "../types";


export = <commands>{
    name: 'ping',
    description: 'muestra el ping',
    category: 'info',
    example: '.ping',
    handle: async (conn: client, m: MessageSerialize) => {
        let inital = new Date().getTime()
        const message = conn.sendMessage(m.chat, { text: '`ping...`' }, { quoted: m })
        let final = new Date().getTime()
        conn.sendMessage(m.chat, { text: `*pong*!! ${inital - final}ms`, edit: (await message).key }, { quoted: m })  
    }
    
}