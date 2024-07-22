import { worker } from "./core/worker"
import { client } from "./core"
import { getGroupAdmins } from "./lib/functions/functions"
import { MessageSerialize } from "./types"
import { config } from "./config"
import chalk from "chalk"
import { proto } from "@whiskeysockets/baileys"
import { inspect } from "util"
import { exec } from "child_process"

const msgs = (message) => { 
  if (message.length >= 10) { 
  return `${message.substr(0, 500)}` 
  } else { 
  return `${message}`}}
const activePins: Record<string, { pin: string, command: any, args: string[], wait: any,}> = {}
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
  const participants = (m.key.remoteJid.endsWith('@g.us') ? groupMetadata.participants : []) || []
  const groupName = (await sock.groupMetadata(m.key.remoteJid)).subject ||  groupMetadata.subject
  const mentionsString: string[] = [sender, m.messageStubParameters[0]]
  const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
  let txt: string
  let pp
  let paramaters: string[] = m.messageStubParameters || []
  console.log(paramaters[0])
  switch(m?.messageStubType) {
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_PROMOTE:
      txt = `*hay un nuevo admin en el grupo ${groupName}*\n*-Nuevo admin*: @${m.messageStubParameters[0].split('@')[0]}\n*-Promovido por*:@${sender.split("@")[0]}`
      sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString }, { quoted: fcontact })
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_DEMOTE:
      txt = `*se elimino a un admin en el grupo ${groupName}*\n*-Nuevo usuario*: @${m.messageStubParameters[0].split('@')[0]}\n*-eliminado de admins por*: @${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}}`
      sock.sendMessage(m.key.remoteJid, { text: txt, mentions: mentionsString }, { quoted: fcontact })
    break
    case chats.detect && proto.WebMessageInfo.StubType.GROUP_CHANGE_ANNOUNCE:
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
    case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_LEAVE:
      /*try {
       pp = await sock.profilePictureUrl(m.messageStubParameters[0], 'image').catch((e) => { console.log(e)})
      } catch (e) {
        pp = 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg'
      }*/
      
      txt = `@${m.messageStubParameters[0].split('@')[0]} salio del grupo. que le vaya bien`
      //if (pp.data == 400) {
        sock.sendText(m.key.remoteJid, txt, fcontact, { mentions: mentionsString})
      //}
      //sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
    break
    case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_REMOVE:
      /*try {
       pp = await sock.profilePictureUrl(m.messageStubParameters[0], 'image').catch((e) => { console.log(e)})
      } catch (e) {
        pp = 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg'
      }*/
      txt = `@${m.messageStubParameters[0].split('@')[0]} fue expulsado por @${sender.split('@')[0]}`
      // (pp.data == 400) {
        sock.sendText(m.key.remoteJid, txt, fcontact, { mentions: mentionsString})
      //}
      //sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
      
    break
    case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ADD:
      /*try {
        pp =  await sock.profilePictureUrl(m.messageStubParameters[0], 'image').catch((e) => { console.log(e)})
       } catch (e) {
         pp = 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg'
       }*/
       txt = `@${m.messageStubParameters[0].split('@')[0]} fue añadido por @${sender.split('@')[0]}`
       //if (pp.data == 400) {
        sock.sendText(m.key.remoteJid, txt, fcontact, { mentions: mentionsString})
      //}
       //sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
    break
    case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ACCEPT:
      /*try {
        pp = await sock.profilePictureUrl(m.messageStubParameters[0], 'image').catch((e) => { console.log(e)})
       } catch (e) {
         pp = 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg'
       }*/
       txt = `@${m.messageStubParameters[0].split('@')[0]} fue aceptado por @${sender.split('@')[0]}`
       
        sock.sendText(m.key.remoteJid, txt, fcontact, { mentions: mentionsString})
    
       //sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
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
      const link = "https://whatsapp.com" + await await sock.groupInviteCode(m.key.remoteJid)
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
    if (m.isBaileys) return
    var budy = (typeof m.text == 'string' ? m.text : '')
    const prefix = /^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)[0] : '!'
    const commandHandler = Worker.commands
    const isCmd = m.body.startsWith(prefix) ?  m.body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : false
    const commandName =  isCmd ? m.body.slice(1).trim().split(/ +/).shift().toLowerCase().split('\n')[0] : null
    const command = commandHandler?.get(commandName)
    const isOwner =  config.creator.includes(m.sender.split("@")[0])
    const groupMetadata = m.isGroup && (await sock.groupMetadata(m.chat))
    const participants = m.isGroup && (await groupMetadata.participants)
    const groupAdmins = m.isGroup && (await getGroupAdmins(participants))
    const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isBotAdmin = m.isGroup ? groupAdmins.includes(sock.user.id) : false
    const chats = global.db.data.chats[m.chat]
    if (chats.ban && !isOwner) return
    console.log(
      chalk.bold.white(`\n▣────────────···\n`),
      chalk.bold.white('\n│📑TIPO (SMS): ') + chalk.yellowBright(`${m.type}`),
      chalk.bold.white('\n│📊USUARIO: ') + chalk.cyanBright(m.pushname) + ' ➜ ', chalk.greenBright(m.sender),
      m.isGroup ? chalk.bold.white('\n│📤GRUPO: ') + chalk.greenBright(await groupMetadata.subject) + ' ➜ ' + chalk.greenBright(m.chat) : chalk.bold.greenBright('\n│📥PRIVADO'),
      chalk.bold.white('\n│💬MENSAJE: ') + chalk.bold.white(`${msgs( await m.text ? m.text : m.body)}`) + chalk.whiteBright(`\n▣────────────···\n`)
    )
    
    var args: string[] = m.body.trim().split(/\s+/).slice(1)
    
    if (isCmd) {
    if (!command) return
    
 
        
    switch(true) {
      case command.groupOnly && !m.isGroup:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar en grupos` }, { quoted: m })
            return

        case command.privateOnly && m.isGroup:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar en privado` }, { quoted: m })
            return

        case command.adminOnly && !isAdmin:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar por administradores` }, { quoted: m })
            return

        case command.nsfw && !chats.antiNsfw:
          await sock.sendMessage(m.chat, { text: `Este comando contiene nsfw. lo cual en este grupo no esta permitido` }, { quoted: m })
          return
        

        case command.isBotAdmin && !isBotAdmin:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar si el bot es admin` }, { quoted: m })
            return

        default:
            try {
              typeof command.handle === "function" && await command.handle(sock, m, Worker, { prefix, args, isAdmin, isBotAdmin, participants })
            } catch (error) {
                await sock.sendMessage(m.chat, { text: `El comando ${commandName} contiene un error\n${error}\nse desabilito el comando` })
                command.errored = true
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