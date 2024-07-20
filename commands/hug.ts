import { client } from "../core"
import { getTenorResults } from "../lib"
import { MessageSerialize } from "../types"

export = {
    name: 'kiss',
    description: 'besa a alguien',
    groupOnly: true, 
    async handle(conn: client, m: MessageSerialize) {
        try {
        var args = m.body.trim().split(/\s+/).slice(1)
        let text = args.join(" ")
        let who =  m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!m.sender) return
        if (!m.message) return
        if (!m.mentionedJid[0]) return await conn.sendMessage(m.chat, { text: 'Debes mencionar a alguien para besar'}, {quoted: m })
        const tenorResults = await getTenorResults({
            query: encodeURIComponent('anime hug'),
            media_filter: 'mp4',
            country: 'US',
            locale: 'en_US',
            random: true,
            limit: 25,
          })
          if (!tenorResults || tenorResults.length === 0) return conn.sendMessage(m.chat, { text: '😥 no encontre ningun video' }, { quoted: m })
          const { url } = tenorResults[0].media_formats.mp4
          const messageAuthorMention = m.sender.split('@')[0]
      
          return conn.sendVideo(m.chat, url, `@${messageAuthorMention} abrazo a @${who.split("@")[0]}`, true, m, { mentions: [m.sender, who]})
        } catch (error) {
            console.log(error)
        }
    }}