import { client } from "../core";
import { youtubeDownloader } from "../lib/functions/functions";
import { commands, MessageSerialize } from "../types";
import yts from 'yt-search'


export = <commands>{
    name: "play",
    description: "descarga videos de youtube",
    category: 'descargas',
    example: ".play shitpost",
    handle: async (conn: client, m: MessageSerialize) => {
        if(!m.args[0]) return await conn.sendMessage(m.chat, { text: "necesitas poner algo para descargar" }, { quoted: m })

        const result = await search(m.args.join(" "), { limit: 1 })
        console.log(result)
        const data = await youtubeDownloader({url: result[0].url})
        console.log(data)

        await conn.sendImage(m.chat, data.thumbnail, `
busqueda de video:
nombre: ${data.videoTitle}

duracion: ${data.duration}

`, m)

        return await conn.sendVideo(m.chat, data.download, 'aqui tienes ', false, m)

        
    }
}

async function search(query, options = {}) {
    const search = await yts.search({ query, hl: "es", gl: "ES", ...options });
    return search.videos}