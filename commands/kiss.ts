
import { client } from "../core/client"
import { getTenorResults } from "../lib"
import { worker } from "../core/worker"
import { MessageSerialize } from "../types"

export = {
    name: 'kiss',
    description: 'besa a alguien',
    groupOnly: true, 
    async handle(conn: client, m: MessageSerialize, Worker: worker) {
        try {
        var args = m.body.trim().split(/\s+/).slice(1)
        let text = args.join(" ")
        let who =  m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (args[0].includes("@yo")) {
            const tenorResults = await getTenorResults({
                query: encodeURIComponent('anime kiss himself'),
                media_filter: 'mp4',
                country: 'US',
                locale: 'en_US',
                random: true,
                limit: 25,
              })
              if (!tenorResults || tenorResults.length === 0) return conn.sendMessage(m.chat, { text: '😥 no encontre ningun video' }, { quoted: m })
              const { url } = tenorResults[0].media_formats.mp4
              const messageAuthorMention = m.sender.split('@')[0]
              return conn.sendVideo(m.chat, url, `@${messageAuthorMention} se esta besando a si mismo??`, true, m, { mentions: [m.sender]})
        }
        //if (!m.mentionedJid[0]) return await conn.sendMessage(m.chat, { text: 'Debes mencionar a alguien para besar'}, {quoted: m })
        const tenorResults = await getTenorResults({
            query: encodeURIComponent('anime kiss'),
            media_filter: 'mp4',
            country: 'US',
            locale: 'en_US',
            random: true,
            limit: 25,
          })
          if (!tenorResults || tenorResults.length === 0) return conn.sendMessage(m.chat, { text: '😥 no encontre ningun video' }, { quoted: m })
          const { url } = tenorResults[0].media_formats.mp4
          const messageAuthorMention = m.sender.split('@')[0]
      
          if (m.mentionedJid[0]) conn.sendVideo(m.chat, url, `@${messageAuthorMention} beso a @${who.split('@')[0]}`, true, m, { mentions: [m.sender, who]})
        } catch (error) {
            console.log(error)
        }
    }}