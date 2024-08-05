
import { client } from "../core"
import { toImage } from "../lib"
import { getRandom, telegraPh } from "../lib/functions/functions"
import { MessageSerialize } from "../types"
import characterAi from 'node_characterai'




const character = new characterAi()


export = {
    name: 'chat',
    aliases: ['bot'],
    description: 'habla con skid!! (beta)',
    category: 'ia',
    handle: async (conn: client, m: MessageSerialize) => {
        const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (conn.user.id.split(":")[0]+'@s.whatsapp.net' || conn.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
        await conn.sendPresenceUpdate('composing', m.chat)
        if (m?.type === 'imageMessage' || m?.quoted?.type === 'imageMessage') {
            const Imedia = m.quoted ? await conn.downloadAndSaveMediaMessage(m.quoted) : await conn.downloadAndSaveMediaMessage(m)

            const result = await telegraPh(Imedia)
            console.log(result)
            return await conn.sendMessage(m.chat, { text: await send(m, result), mentions: [m.sender] }, { quoted: fcontact })
        }

    
        return await conn.sendMessage(m.chat, { text: await send(m), mentions: [m.sender] }, { quoted: fcontact })
    }
}

async function send (m: MessageSerialize, buffer?: string) {
    await character.authenticateWithToken('7c2367343159c0a97985a7b240ddda06cafd617f')
    const characterId = 'LkC1Le70gnGX__zHwjPLBoWZa3WpJU68diro-a8nqgQ'
    let chat; let response;
    if (buffer) {
    chat = await character.createOrContinueChat(characterId)
    const image = await chat.uploadImage(buffer)
    console.log(image)
    response = await chat.sendAndAwaitResponse({text:  `[${m.pushname}] ${m.args.join(' ')}`, image_rel_path: image}, true)
    console.log(response)
    await character.unauthenticate()
    return response.text as string
    } else {
    chat = await character.createOrContinueChat(characterId)
    response = await chat.sendAndAwaitResponse({text:  `[${m.pushname}] ${m.args.join(' ')}`}, true)
    console.log(response)
    await character.unauthenticate()
    return response.text as string
    }
    
}