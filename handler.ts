import { worker } from "./core/worker"
import { client } from "./core"
import { getGroupAdmins, getRandom, patchImage, pickRandom } from "./lib/functions/functions"
import { MessageSerialize, commands } from "./types"
import { config } from "./config"
import chalk from "chalk"
import { proto } from "@whiskeysockets/baileys"
import { replace } from "lodash"



const msgs = (message) => { 
  if (message.length >= 10) { 
  return `${message.substr(0, 500)}` 
  } else { 
  return `${message}`}}

/* created by skidy89
if u steal this u gay
jk folks
github.com/skidy89 :p
*/
/**
 * @author skidy89
 * @param sock 
 * @param m 
 * @returns 
 */
export const welcomes = async (sock: client, m: proto.IWebMessageInfo) => {
  if (!m.messageStubType || !m.key.remoteJid) return !0
  console.log(m.messageStubParameters)
  console.log(m?.messageStubType)
  const chats = global.db.data.chats[m.key.remoteJid]
  if (chats.ban) return
  const sender = m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid)
  const groupMetadata = m.key.remoteJid.endsWith('@g.us') && (await sock.groupMetadata(m.key.remoteJid))
  const groupName = (await sock.groupMetadata(m.key.remoteJid)).subject ||  groupMetadata.subject
  const mentionsString: string[] = [sender, m.messageStubParameters[0]]
  const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
  let txt: string
  let pp
  let paramaters: string[] = m.messageStubParameters || []
  console.log(paramaters[0])
  switch(m?.messageStubType) {
    case proto.WebMessageInfo.StubType.CIPHERTEXT:
    console.log(chalk.yellowBright.bold("[Client] ") + 'no sender key found for decription\ntrying decription')
    let message: number
    try {
      sock.uploadPreKeys(2)
      message = message + 1
      console.log(chalk.greenBright.bold("[Client] ") + 'succeful decription\n')
    } catch {
      console.log(chalk.yellowBright.bold("[Client] ") + 'invalid prekey id')
    }
    
    break
    case chats?.detect && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_PROMOTE:
      txt =  `*hay un nuevo admin en el grupo ${groupName}*\n*-Nuevo admin*: @${m.messageStubParameters[0].split('@')[0]}\n*-Promovido por*:@${sender.split("@")[0]}`
      sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString }, { quoted: fcontact })
    break
    case chats?.detect && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_DEMOTE:
      txt = `*se elimino a un admin en el grupo ${groupName}*\n*-Nuevo usuario*: @${m.messageStubParameters[0].split('@')[0]}\n*-eliminado de admins por*: @${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}}`
      sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString }, { quoted: fcontact })
    break
    case chats?.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_ANNOUNCE:
      switch (paramaters[0]) {
        case 'on':
          txt = `@${sender.split('@')[0]} cambio los ajustes para que solo los admins puedan enviar mensajes`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: [sender] }, { quoted: fcontact })
        break
        case 'off':
          txt = `@${sender.split('@')[0]} cambio los ajustes para que todos puedan enviar mensajes`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: [sender] }, { quoted: fcontact })
        break
      }
    break
    case chats?.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_LEAVE:
      pp = await patchImage(sock, m, 'goodbye')
      
      txt = `@${m.messageStubParameters[0].split('@')[0]} salio del grupo. que le vaya bien`
      sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
    break
    case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_REMOVE:
      pp = await patchImage(sock, m, 'goodbye')
      txt = `@${m.messageStubParameters[0].split('@')[0]} fue expulsado por @${sender.split('@')[0]}`
      sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
      
    break
    case chats?.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ADD:
       pp = await patchImage(sock, m, 'welcome')
       txt = chats.welcomeMessage ? chats.welcomeMessage.replace("{name}",  "@" + m.messageStubParameters[0].split('@')[0]) : `@${m.messageStubParameters[0].split('@')[0]} fue agregado por @${sender.split('@')[0]}`
       sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
    break
    case chats?.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ACCEPT:
       pp = await patchImage(sock, m, 'welcome')
       txt = `@${m.messageStubParameters[0].split('@')[0]} fue aceptado por @${sender.split('@')[0]}`
       sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_MEMBER_ADD_MODE:
      switch(paramaters[0]) {
        case 'admin_add':
          txt = `@${sender.split('@')[0]} desactivo que los miembros añadan a otros`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
        case 'all_member_add':
          txt = `@${sender.split('@')[0]} permitio que los miembros añadan a otros`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
      }     
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_INVITE_LINK:
      const link = "https://whatsapp.com" + await sock.groupInviteCode(m.key.remoteJid)
      txt = `@${sender.split("@")[0]} cambio el link del grupo\n~nuevo link: ${link}`
      sock.sendText(m.key.remoteJid, txt, fcontact)
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_MEMBERSHIP_JOIN_APPROVAL_MODE:
      switch(paramaters[0]) {
        case 'on':
          txt = `@${sender.split('@')[0]} activo la aprobacion de admins`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
        case 'off':
          txt = `@${sender.split('@')[0]} desactivo la aprobacion de admins`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
      }
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_SUBJECT:
      txt = `@${sender.split('@')[0]} cambio el nombre del grupo\nNuevo nombre: ${groupMetadata.subject}`
      sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_ICON:
      let picture: string
      picture = await sock.profilePictureUrl(m.key?.remoteJid, "image")
      txt = `@${sender.split('@')[0]} cambio la foto del grupo`
      sock.sendImage(m.key.remoteJid, picture, txt, fcontact, {mentions: mentionsString})
    break

    case chats.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_RESTRICT:
      switch(paramaters[0]) {
        case 'on':
          txt = `@${sender.split('@')[0]} cambio los ajustes para que los miembros editen la informacion del grupo`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
        case 'off':
          txt = `@${sender.split('@')[0]} cambio los ajustes para que solo los admins editen la informacion del grupo`
          sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString}, { quoted: fcontact})
        break
      }
    break

  }
}
/**
 * 
 * @param sock 
 * @param m 
 * @param Worker 
 * @returns 
 */
export async function handle(sock: client, m: MessageSerialize, Worker: worker) {
    if (!m || !m.body) return
    var budy = (typeof m.text == 'string' ? m.text : '')
    const prefix = /^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)[0] : '!'
    const commandHandler = Worker?.commands
    const isCmd = m?.body?.startsWith(prefix) ?  m?.body?.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : false
    const commandName =  isCmd && m.body?.replace(prefix, "").split(/ +/).shift().toLowerCase()
    const command = commandHandler?.get(commandName) ?? Array.from(commandHandler.values()).find((v) => v?.aliases?.find((x) => x?.toLowerCase() == commandName)) 
    const isOwner =  config.creator.includes(m.sender.split("@")[0])
    const groupMetadata = m.isGroup && (await sock?.groupMetadata(m.chat))
    const participants = m.isGroup && (await groupMetadata.participants)
    const groupAdmins = m.isGroup && (await getGroupAdmins(participants))
    const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isBotAdmin = m.isGroup ? groupAdmins.includes(sock.user.id) : false
    const chats = global.db?.data?.chats[m.chat]
    const users = global.db?.data?.users[m.sender]
    const image = pickRandom(['https://i.pinimg.com/564x/da/18/77/da187754a16af4b8bc1979014bfde056.jpg', 'https://i.pinimg.com/736x/64/a2/00/64a20057d79f916dd673f13dbf2bc537.jpg', 'https://i.pinimg.com/564x/53/da/32/53da32becd006fc51e328d84322f7f5a.jpg', 'https://i.pinimg.com/564x/80/0c/5b/800c5b1652e5b8859ef7f9cd8c03d409.jpg', 'https://i.pinimg.com/564x/70/dc/f5/70dcf5baf62fc9df57f97b877b4162af.jpg'])
    const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
    if (chats.ban && !isOwner) return
    if (m) {
    console.log(
      chalk.bold.white(`\n▣────────────···\n`),
      chalk.bold.white('\n│📑TIPO (SMS): ') + chalk.yellowBright(`${m.type}`),
      chalk.bold.white('\n│📊USUARIO: ') + chalk.cyanBright(m.pushname) + ' ➜ ', chalk.greenBright(m.sender),
      m.isGroup ? chalk.bold.white('\n│📤GRUPO: ') + chalk.greenBright(await groupMetadata.subject) + ' ➜ ' + chalk.greenBright(m.chat) : chalk.bold.greenBright('\n│📥PRIVADO'),
      chalk.bold.white('\n│💬MENSAJE: ') + chalk.bold.white(`${msgs( await m.text ? m.text : m.body)}`) + chalk.whiteBright(`\n▣────────────···\n`)
    )
    users.exp += 1
  }
    
    var args: string[] = m.body.trim().split(/\s+/).slice(1)
    
    if (isCmd) {
    if (!command) return
    if (command) {
      if (/(--help|--ayuda|-h|-help)/.test(args[0])) {
        const str =
        `*「 HELPER 」*\n\n` +
        `★ ɴᴏᴍʙʀᴇ : ${command.name}\n` +
        `★ Alias : ${command.aliases ? command.aliases.map((e) => e.toString()).join(", ") : "sin alias"}\n` +
        `★ Category : ${command.category ? command.category : "sin categoria"}\n` +
        `★ Description : ${command.description ? command.description : "sin descripción"}\n` +
        `${command.errored? `★ ᴇꜱᴛᴀᴅᴏ : con errores ⚠\n`: `• Estado : funcional ✅\n`}` +
        `${command.usage ? `★ ᴜꜱᴏ : ${command.usage}\n` : ""}` +
        `${command.example ? `★ ᴇᴊᴇᴍᴘʟᴏ : \n${command.example}` : ""}`
        return  await sock.sendText(m.chat, str, fcontact)
      }
      if((/(--functional|-f|-repair)/.test(args[0])) && isOwner) {
        if (!command?.errored) sock.sendText(m.chat, `este comando no tiene errores`)
        else command.errored = false
        return sock.sendText(m.chat, `el comando ${command.name} ha sido quitado de la lista de errores!`, fcontact)
        
      }
      
    }
    
 
        
    switch(true) {
      
      case command && global.db.data.users[m.sender].banned:
      return
      case command.groupOnly && !m.isGroup:
            await sock.sendMessage(m.chat, { text: `(虞岡科疫仮ぐ永ト) ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ꜱᴏʟᴏ ꜱᴇ ᴘᴜᴇᴅᴇ ᴜꜱᴀʀ ᴇɴ ɢʀᴜᴘᴏꜱ`, contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363303707275621@newsletter',
                newsletterName: 'skid bot',
                serverMessageId: -1,
                contentType: 1,
                
              },
              externalAdReply: {
                title: 'usalo en grupos',
                body: null,
                mediaType: 1,
                sourceUrl: 'https://wa.me/settings',
                sourceId: 'https://www.xnxx.com',
                sourceType: 'url',
                thumbnailUrl: image,
                containsAutoReply: true,
                showAdAttribution: true
              }}}, { quoted: m })
            return

        case command.privateOnly && m.isGroup:
            await sock.sendMessage(m.chat, { text: `（因ネソ慰　え竹扱　尉) ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ꜱᴏʟᴏ ꜱᴇ ᴘᴜᴇᴅᴇ ᴜꜱᴀʀ ᴇɴ ᴘʀɪᴠᴀᴅᴏ`, contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363303707275621@newsletter',
                newsletterName: 'skid bot',
                serverMessageId: -1,
              },
              externalAdReply: {
                title: 'usalo en chats',
                body: null,
                mediaType: 1,
                sourceUrl: 'https://wa.me/settings',
                sourceId: 'https://www.xnxx.com',
                sourceType: 'url',
                containsAutoReply: true,
                thumbnailUrl: image,
                showAdAttribution: true
              }}}, { quoted: m })
            return
            case command.ownerOnly && !isOwner:
            await sock.sendMessage(m.chat, { text: `(ル異岡ル) no eres owner`, contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363303707275621@newsletter',
                newsletterName: 'skid bot',
                serverMessageId: -1,
              },
              externalAdReply: {
                title: 'no eres propietario',
                body: null,
                mediaType: 1,
                sourceUrl: 'https://wa.me/settings',
                sourceId: 'https://www.xnxx.com',
                sourceType: 'url',
                containsAutoReply: true,
                thumbnailUrl: image,
                showAdAttribution: true
              } 
            }})

        case command.adminOnly && !isAdmin:
            await sock.sendMessage(m.chat, { text: `(ル異岡ル) 𝚗𝚘 𝚎𝚛𝚎𝚜 𝚊𝚍𝚖𝚒𝚗`, contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363303707275621@newsletter',
                  newsletterName: 'skid bot',
                  serverMessageId: -1,
                },
                externalAdReply: {
                  title: 'no eres admin',
                  body: null,
                  mediaType: 1,
                  sourceUrl: 'https://wa.me/settings',
                  sourceId: 'https://www.xnxx.com',
                  sourceType: 'url',
                  containsAutoReply: true,
                  thumbnailUrl: image,
                  showAdAttribution: true
                }
            } }, { quoted: m })
            return

        case command.nsfw && chats.antiNsfw:
          await sock.sendMessage(m.chat, { text: `Este comando contiene nsfw. lo cual en este grupo no esta permitido`, contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363303707275621@newsletter',
              newsletterName: 'skid bot',
              serverMessageId: -1,
            },
            externalAdReply: {
              title: 'no nsfw',
              body: null,
              mediaType: 1,
              sourceUrl: 'https://wa.me/settings',
              sourceId: 'https://www.xnxx.com',
              sourceType: 'url',
              containsAutoReply: true,
              thumbnailUrl: image,
              showAdAttribution: true
            }}}, { quoted: m })
          return
        

        case command.isBotAdmin && !isBotAdmin:
            await sock.sendMessage(m.chat, { text: `（コグタンラぷヿて位　蒸）`, contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363303707275621@newsletter',
                newsletterName: 'skid bot',
                serverMessageId: -1,
              },
              externalAdReply: {
                title: 'no eres admin',
                body: null,
                mediaType: 1,
                sourceUrl: 'https://wa.me/settings',
                sourceId: 'https://www.xnxx.com',
                sourceType: 'url',
                containsAutoReply: true,
                thumbnailUrl: image,
                showAdAttribution: true
              }}}, { quoted: m })
            return

        case command.errored && !isOwner:
          await sock.sendMessage(m.chat, { text: '(嵐温ぎほ炎ヷブ加) ᴇꜱᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ꜰᴜᴇ ᴅᴇꜱᴀᴄᴛɪᴠᴀᴅᴏ ᴅᴇʙɪᴅᴏ ᴀ ᴜɴ ᴇʀʀᴏʀ', contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363303707275621@newsletter',
              newsletterName: 'skid bot',
              serverMessageId: -1,
            },
            externalAdReply: {
              title: 'comando desactivado',
              body: null,
              mediaType: 1,
              sourceUrl: 'https://wa.me/settings',
              sourceId: 'https://www.xnxx.com',
              sourceType: 'url',
              containsAutoReply: true,
              thumbnailUrl: image,
              showAdAttribution: true
            }}}, { quoted: m})
        return

        default:
            try {
              typeof command.handle === "function" && await command.handle(sock, m, Worker, { prefix, args, isAdmin, isBotAdmin, participants })
            } catch (error) {
                if (command.errored) {
                  await sock.sendMessage(m.chat, { text: 'este comando ya fue desabilitado.\nse esta depurando y enviando logs a tu consola'}, {quoted: m})
                  console.log(error)
                } else {
                await sock.sendMessage(m.chat, { text: `El comando ${commandName} contiene un error\n${error}\nse desabilito el comando` })
                command.errored = true
                }
            }
    }}
    if (budy.startsWith('>')) {
      if (!isOwner) return
      try {
          return m.reply(JSON.stringify(eval(budy.slice(2)), null, '\t'))
      } catch (e) {
          e = String(e)
          m.reply(e)
      }
    }
}