
import { commands, MessageSerialize } from "../types"
import { client } from "../core"
import { isURL } from "../lib"
import { format } from "path"


export = <commands>{
    name: 'get',
    description: 'obtener un link',
    example: '.get https://google.com',
    category: 'owner',
    ownerOnly: false,
    async handle(conn: client, m: MessageSerialize) {
        if (!m.args[0]) return await conn.sendMessage(m.chat, { text: 'envia un link' }, { quoted: m })
        if (!isURL) return await conn.sendMessage(m.chat, { text: 'link invalido' }, { quoted: m })
        
        const response = await fetch(m.args[0])
        let txt = await response.text()
        
          

        if (!/text|json/.test(response.headers.get('content-type'))) conn.sendImage(m.chat, m.args[0], null, m)
        

        return await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}