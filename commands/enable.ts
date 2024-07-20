import { client, worker } from "../core"
import { MessageSerialize } from "../types"

export = {
    name: 'enable',
    description: 'activa comandos',
    groupOnly: true, 
    async handle(conn: client, m: MessageSerialize, Worker: worker, {prefix, args, isAdmin, isBotAdmin}) {

        const chats = global.db.data.chats[m.chat]
        let txt = `
╭────❏ *BETA* ❏\n
│${prefix} welcome
│${prefix} events
│${prefix} banchat
╰━━━━━━━━━━━━━──⊷
`
    const type = (args[0] || '').toLowerCase()
    switch (type) {
        case m.isGroup && 'welcome':
            if (!isAdmin) {
                m.reply('no puedes activar esto. no eres admin')
            } else {
                chats.welcome = true
                m.reply('exito!!')
            }
        break
        case m.isGroup && 'events':
            if (!isAdmin) {
                m.reply('no puedes activar esto. no eres admin')
            } else {
                chats.events = true
                m.reply('exito!!')
            }
        break
        case m.isGroup && 'ban':
            if (!isAdmin) {
                m.reply('no puedes activar esto. no eres admin')
            } else {
                chats.ban = true
                m.reply('exito!!')
            }
        break

        default:
            conn.sendText(m.chat, txt, m)

    }
    }}

