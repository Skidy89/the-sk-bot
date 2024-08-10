import { Icommand } from "./core/worker"
import { client, dataSessions } from "./core"
import { getGroupAdmins, getRandom, patchImage, pickRandom } from "./lib/functions/functions"
import { ChatType, MessageSerialize, SettingType, UserType } from "./types"
import { config } from "./config"
import chalk from "chalk"
import { proto } from '@whiskeySockets/baileys'


const msgs = (message: string) => { 
  if (message.length >= 10) { 
  return `${message.substring(0, 500)}` 
  } else { 
  return `${message}`}}
  const fcontact = {
    'key': {
        'participants': '0@s.whatsapp.net',
        'remoteJid': 'status@broadcast',
        'fromMe': false,
        'id': getRandom(23)
    },
    'message': {
        'contactMessage': {
            'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid={WAID}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
    },
    'participant': '0@s.whatsapp.net'
}

  export const welcomes = async (sock: client, m: proto.IWebMessageInfo) => {
    if (!m.messageStubType || !m.key.remoteJid) return !0
    const chats = globalThis.db?.data?.chats[m.key.remoteJid] || {} as ChatType
    if (chats?.ban) return
    const sender = m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid)
    const groupMetadata = m.key.remoteJid.endsWith('@g.us') && (await sock.getMetadata(m.key.remoteJid))
    const groupName = (await sock.getMetadata(m.key.remoteJid)).subject ||  groupMetadata.subject
    const mentionsString: string[] = [sender, m.messageStubParameters[0]]
    const fcontact = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': getRandom(23)}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]}:${m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid).split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'}
    let txt: string
    let pp
    let paramaters: string[] = m.messageStubParameters || []
    switch(m?.messageStubType) {
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
        pp = await patchImage(sock, m.messageStubParameters[0], 'goodbye')
        
        txt = `@${m.messageStubParameters[0].split('@')[0]} salio del grupo. que le vaya bien`
        sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
      break
      case chats.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_REMOVE:
        pp = await patchImage(sock, m.messageStubParameters[0], 'goodbye')
        txt = `@${m.messageStubParameters[0].split('@')[0]} fue expulsado por @${sender.split('@')[0]}`
        sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
        
      break
      case chats?.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ADD:
         pp = await patchImage(sock, m.messageStubParameters[0], 'welcome')
         txt = chats.welcomeMessage ? chats.welcomeMessage.replace("{name}",  "@" + m.messageStubParameters[0].split('@')[0]) : `@${m.messageStubParameters[0].split('@')[0]} fue agregado por @${sender.split('@')[0]}`
         sock.sendImage(m.key.remoteJid, pp, txt, fcontact, { mentions: mentionsString})
      break
      case chats?.welcome && proto.WebMessageInfo.StubType.GROUP_PARTICIPANT_ACCEPT:
         pp = await patchImage(sock, m.messageStubParameters[0], 'welcome')
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


  export const handle = async (sock: client, m: MessageSerialize) => {
    const settings: SettingType = globalThis.db?.data?.settings[sock.decodeJid(sock.user.id)]
    const chats: ChatType = globalThis.db?.data?.chats[m.chat]
    const users: UserType = globalThis.db?.data?.users[m.sender]
    const prefix = /^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)[0] : /^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?#$%^&.©^]/gi.test(m.text) ? m.text.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)[0] : '!'
    const isCmd = m?.body?.startsWith(prefix) ?  m?.body?.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : false
    const commandName =  isCmd && m.body?.replace(prefix, "").split(/ +/).shift().toLowerCase()
    const command = Icommand?.get(commandName) ?? Array.from(Icommand.values()).find((v) => v?.aliases?.find((x) => x?.toLowerCase() == commandName))
    const isOwner =  config.creator.includes(m.sender.split("@")[0])
    const groupMetadata = await sock.getMetadata(m.chat)
    const participants = m.isGroup && groupMetadata?.participants
    const isAdmin = m.isGroup ? getGroupAdmins(m.chat, participants).includes(m.sender) : false
    const isBotAdmin = m.isGroup ? getGroupAdmins(m.chat, participants).includes(sock.decodeJid(sock.user!.id)) : false
    const image = ['https://i.pinimg.com/736x/0c/c5/09/0cc509ddcad9986a8aef3e8810d9998b.jpg', 'https://i.pinimg.com/736x/c0/c6/76/c0c67647ecf426e9699c2ed1fe08e07c.jpg', 'https://i.pinimg.com/736x/64/a2/00/64a20057d79f916dd673f13dbf2bc537.jpg', 'https://i.pinimg.com/564x/53/da/32/53da32becd006fc51e328d84322f7f5a.jpg', 'https://i.pinimg.com/564x/70/dc/f5/70dcf5baf62fc9df57f97b877b4162af.jpg']
    const waid = m.key.fromMe ? (sock.decodeJid(sock.user.id) || sock.user.id) : (m.key.participant || m.key.remoteJid).split('@')[0]
    fcontact.message.contactMessage.vcard = fcontact.message.contactMessage.vcard.replace(/{WAID}/g, waid)

       
    

    if (chats.ban && command.name !== 'unban' && !isOwner)  return
    if (m) {
    console.log(
      chalk.bold.white(`\n▣────────────···\n`),
      chalk.bold.white('\n│📑TIPO (SMS): ') + chalk.yellowBright(`${m.type}`),
      chalk.bold.white('\n│📊USUARIO: ') + chalk.cyanBright(m.pushname) + ' ➜ ', chalk.greenBright(m.sender),
      m.isGroup ? chalk.bold.white('\n│📤GRUPO: ') + chalk.greenBright(groupMetadata.subject) + ' ➜ ' + chalk.greenBright(m.chat) : chalk.bold.greenBright('\n│📥PRIVADO'),
      chalk.bold.white('\n│💬MENSAJE: ') + chalk.bold.white(`${msgs(m.text ? m.text : m.body)}`) + chalk.whiteBright(`\n▣────────────···\n`)
    )
      users.exp += 1
    }
    if (isCmd && command) {
      if (/(--help|--ayuda|-h|-help)/.test(m.args[0])) {
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
      if((/(--functional|-f|-repair)/.test(m.args[0])) && isOwner) {
        if (!command?.errored) return sock.sendText(m.chat, `este comando no tiene errores`)
        else command.errored = false
        return sock.sendText(m.chat, `el comando ${command.name} ha sido quitado de la lista de errores!`, fcontact)
      }
      switch (true) {
        case command.subbots && m.sender !== sock.decodeJid(sock.user!.id):
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado por subbots', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.ownerOnly && !isOwner:
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado por el owner', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.adminOnly && !isAdmin:
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado por un admin', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.isBotAdmin && !isBotAdmin:
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado si el bot es admin', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.groupOnly && !m.isGroup:
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado en grupos', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.nsfw && !chats.antiNsfw:
          return sock.sendADMessage(m.chat, 'este comando contiene contenido inapropiado (nsfw). para habilitar este contenido usa /enable antinewsfw', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.privateOnly && m.isGroup:
          return sock.sendADMessage(m.chat, 'este comando solo puede ser usado en chats privados', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        case command.errored && !isOwner:
          return sock.sendADMessage(m.chat, 'este comando fue desactivado. por un posible error', settings.botName ? settings.botName : 'skid bot', 'no puedes usar este comando', settings.urlLinks ? settings.urlLinks : 'https://wa.me/settings',  settings.menuImage.length > 0 ? pickRandom(settings.menuImage) : pickRandom(image), false, fcontact)
        default:
          try {
          typeof command.handle === "function" && await command.handle(sock, m, { prefix, isAdmin, isBotAdmin, participants })
          } catch (e) {
            if (command.errored) return
            command.errored = true
            console.log(e)
            m.reply(`❌ Ocurrio un error inesperado: ${e}\nSe ha desactivado el comando`, m.chat, fcontact)
          }
      }
    }
    if (m.text.startsWith('>')) {
      if (!isOwner) return
      try {
          return m.reply(JSON.stringify(eval(m.text.slice(2)), null, '\t'))
      } catch (e) {
          m.reply(String(e))
      }
    }
  }