import { client } from "../client"
import { ChatType, low, MessageSerialize, SettingType, UserType } from "../../types"
import { proto, WAMessage, AnyMessageContent, MessageType } from '@whiskeySockets/baileys'

export const expToLevelUp = (level: number) => Math.floor(100 * Math.pow(1.5, level))
declare var globalThis: {
  db: low
}




/**
 * Extracts the body from the message based on its type.
 * @param m MessageSerialize
 * @returns The message body.
 */
const getMessageBody = (m: MessageSerialize): string => {
  switch (m.type) {
      case "conversation": return m.message.conversation
      case "extendedTextMessage": return m.message.extendedTextMessage.text
      case "imageMessage":
      case "videoMessage": return m.message[m.type].caption
      case "locationMessage": return m.message.locationMessage.comment
      case "listResponseMessage": return m.message.listResponseMessage.singleSelectReply.selectedRowId
      case "templateButtonReplyMessage": return m.message.templateButtonReplyMessage.selectedId
      case "buttonsResponseMessage": return m.message.buttonsResponseMessage.selectedButtonId
      case "reactionMessage": return m.message.reactionMessage.text
      case "interactiveResponseMessage": const paramsJson = m?.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson; if (paramsJson) { return JSON.parse(paramsJson).id }
      case "documentMessage": return m.message.documentMessage?.caption || "Document Message"
      case "audioMessage": return "Audio Message"
      case "stickerMessage": return "Sticker Message"
      case "contactMessage": return "Contact Message"
      case "productMessage": return "Product Message"
      case "pollCreationMessage": return "Poll Message"
      case "protocolMessage": return "Protocol Message"
      case "buttonsMessage": return "Buttons Message"
      case "listMessage": return "List Message"
      default: return 'undetected'
  }
}
/**
 * parse the message for easy use
 * @param sock WASocket
 * @param message WAMessage
 * @returns 
 */
export const message = async (sock: client, message: WAMessage): Promise<proto.IWebMessageInfo> => {
    const m = <MessageSerialize>{}
    if (!message) return
    if (!m) return
    let protocolMessageKey
    m.key = message.key
    if (message.message) {
        m.chat = m.key.remoteJid
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender =  m.key.fromMe ? (sock.decodeJid(sock.user.id) || sock.user.id) : (message.key.participant || message.key.remoteJid)
        m.message = message.message
        m.type = Object.keys(m.message)[0] as MessageType
        m.isNewsLetter = m.chat.endsWith('@newsletter')
        m.body = getMessageBody({...m, type: Object.keys(message.message)[0] as MessageType})
        m.args = m.body.trim().split(/ +/).slice(1)
        m.arg = m.body.substring(m.body.indexOf(" ") + 1)
        m.messageTimestamp = message.messageTimestamp
        m.isBroadcast = message.broadcast
        
        

        if (m.type == 'protocolMessage' && m.message[m.type].key) { 
            protocolMessageKey = m.message[m.type].key 
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat 
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender 
            protocolMessageKey.fromMe = sock.decodeJid(protocolMessageKey.participant) === sock.decodeJid(sock.user.id) 
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === sock.decodeJid(sock.user.id)) protocolMessageKey.remoteJid = m.sender 
        }
        if (m.type === 'viewOnceMessage' || m.type === 'viewOnceMessageV2') {
          const tipe = Object.keys(m.message.viewOnceMessage.message)[0]
          
        }


        
        m.download = async () => sock.downloadMediaMessage(m)
        m.status = message?.status
        let quoted = m.quoted = m.message[m.type]?.contextInfo?.quotedMessage
        m.mentionedJid = m.message[m.type]?.contextInfo ? m.message[m.type]?.contextInfo?.mentionedJid : []
        if (quoted) {
            m.quoted.message = m.message[m.type].contextInfo.quotedMessage
            m.quoted.type = Object.keys(m.message[m.type].contextInfo.quotedMessage)[0]
            m.quoted.delete = async () => {
              let vM = proto.WebMessageInfo.fromObject({
                key: {
                  remoteJid: m.message[m.type].contextInfo.remoteJid || m.chat,
                  fromMe: m.message[m.type].contextInfo.participant.split(':')[0] === (sock.user && sock.user.id),
                  id: m.message[m.type].contextInfo.stanzaId
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.message[m.type].contextInfo.participant } : {})
              })
              await sock.sendMessage(m.message[m.type].contextInfo.remoteJid || m.chat, { delete: vM.key })
            }
            m.quoted.download = async () => sock.downloadMediaMessage(m.quoted)
          } else m.quoted = null
            m.eventMessage = message.eventResponses || []
            m.pushname = message.pushName || message.verifiedBizName || sock.user.name || sock.user.verifiedName || 'unknown'
            m.reply = async (text: string, jid?: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => await sock.sendMessage(jid ? jid : m.chat, { text: text, ...options }, { quoted: quoted ? quoted : m })

            if (m.message[m.type]?.url) m.download = () => sock.downloadMediaMessage(m.message[m.type])
                m.text = m.message[m.type]?.text || m.message[m.type]?.caption || m.message?.conversation || m.message[m.type]?.contentText || m.message[m.type]?.selectedDisplayText || m.message[m.type]?.title || m.message[m.type]?.interactiveMessage || ''
    }
    
    
    const jid = sock.decodeJid(sock.user.id)
    try {
      const isNumber = (x: unknown): x is number => typeof x === 'number' && !isNaN(x)
      const Iuser = (user: Partial<UserType>): UserType => ({
        name:  user.name || m.pushname,
        turnAbility: isNumber(user.turnAbility) ? user.turnAbility : 0,
        health: Math.max(0, Math.min(isNumber(user.health) ? user.health : 100, user.especial === 'warrior' || user.especial === 'ninguno' ? 100 : user.especial === 'gambler' ? 350 : Infinity)),
        afkTime: isNumber(user.afkTime) ? user.afkTime : 0,
        afkReason: user.afkReason || '',
        luck: isNumber(user.luck) ? user.luck : 0,
        gold: isNumber(user.gold) ? user.gold : 0,
        exp: isNumber(user.exp) ? user.exp : 0,
        iron: isNumber(user.iron) ? user.iron : 0,
        ability: isNumber(user.ability) ? user.ability : 0,
        especial: user.especial || 'ninguno',
        level: isNumber(user.level) ? user.level : 0,
        role: user.role || '',
        meat: isNumber(user.meat) ? user.meat : 0,
        pet: isNumber(user.pet) ? user.pet : 0,
        petName: user.petName || '',
        petRarity: isNumber(user.petRarity) ? user.petRarity : 0,
        petExp: isNumber(user.petExp) ? user.petExp : 0,
        petLevel: Math.max(0, isNumber(user.petLevel) ? user.petLevel : 0),
        petHealth: Math.max(0, isNumber(user.petHealth) ? user.petHealth : 0),
    
        attack: isNumber(user.attack) ? user.attack : 10,
        defense: isNumber(user.defense) ? user.defense : 0,
        speed: isNumber(user.speed) ? user.speed : 0,
        potion: isNumber(user.potion) ? user.potion : 0,
        money: isNumber(user.money) ? user.money : 0,
        bow: isNumber(user.bow) ? user.bow : 0,
        sword: isNumber(user.sword) ? user.sword : 0,
        swordName: user.swordName || '',
        pickaxeName: user.pickaxeName || '',
        armorName: user.armorName || '',
        limit: isNumber(user.limit) ? user.limit : 0,
        lastClaim: isNumber(user.lastClaim) ? user.lastClaim : 0,
        lastDaily: isNumber(user.lastDaily) ? user.lastDaily : 0,
        lastStreak: isNumber(user.lastStreak) ? user.lastStreak : 0,
        lastWork: isNumber(user.lastWork) ? user.lastWork : 0,
        lastRob: isNumber(user.lastRob) ? user.lastRob : 0,
        armor: isNumber(user.armor) ? user.armor : 0,
        armorDurability: Math.max(0, isNumber(user.armorDurability) ? user.armorDurability : 0),
        pickaxe: isNumber(user.pickaxe) ? user.pickaxe : 0,
        pickaxeDurability: Math.max(0, isNumber(user.pickaxeDurability) ? user.pickaxeDurability : 0),
        swordDurability: Math.max(0, isNumber(user.swordDurability) ? user.swordDurability : 0),
        shield: isNumber(user.shield) ? user.shield : 0,
        shieldDurability: Math.max(0, isNumber(user.shieldDurability) ? user.shieldDurability : 0),
        deaths: isNumber(user.deaths) ? user.deaths : 0,
        lastAventure: isNumber(user.lastAventure) ? user.lastAventure : 0,
      })
      if (m.sender && !m.isGroup && m.sender.endsWith('@lid')) {
        const user: UserType = globalThis.db.data.users[m.sender] = Iuser(globalThis.db.data.users[m.sender] || {})

      
      if (user) {
      if (user.health > 100 && user.especial === 'warrior' || user.especial === 'ninguno') user.health = 100
      if (user.health > 350 && user.especial === 'gambler') user.health = 350
      if (user.swordDurability < 0) user.swordDurability = 0
      if (user.armorDurability > 100 && user.especial === 'gambler' || user.especial === 'ninguno') user.armorDurability = 100
      if (user.armorDurability > 100 + user.level && user.especial === 'warrior') user.armorDurability = 120 + user.level
      if (user.health <= 0) {
        user.health = 1
        const loseItems = ['gold', 'iron', 'meat', 'potion', 'money']
        let lostItems = []
    
        loseItems.forEach((item) => {
          if (user[item] > 0) {
            lostItems.push(`${user[item]} ${item}`)
            user[item] -= Math.floor(user[item] * 0.5)
          }
        })
    
        if (user.especial === 'gambler') {
          if (Math.random() < Math.min(user.luck / 100, 1)) {
            user.health += 50
            return sock.sendText(m.chat, 'No tienes tiempo para morir. Tu suerte te dio 50 de salud.')
          }
          user.deaths += 1
          return sock.sendText(m.chat, `Parece que tu suerte hoy no te salva. Te has muerto.  Te has muerto. ${lostItems.length > 0 ? `objecto(s) perdido: ${lostItems.join(', ')}` : ''}`)
        } else if (user.especial === 'warrior') {
          user.deaths += 1
          return sock.sendText(m.chat, `No importa lo fuerte que seas. Te has muerto. ${lostItems.length > 0 ? `objecto(s) perdido: ${lostItems.join(', ')}` : ''}`)
        } else {
          user.deaths += 1
          return sock.sendText(m.chat, `Te has muerto. ${lostItems.length > 0 ? `objecto(s) perdido: ${lostItems.join(', ')}` : ''}`)
        }
      }
      
      
      const expNeeded = expToLevelUp(user.level)
      
      
      if (user.exp >= expNeeded) {
        user.level += 1
        user.exp = 0
        sock.sendMessage(m.chat, { text: patchpassive(user) })
      }
      if (user.especial === 'gambler') {
        user.defense = 0
        if (user.luck > 100) user.luck = 100
      }
      if (user.especial === 'warrior') {
        user.health += 0.1
      }
    }
   }

    const Ichat = (chat: Partial<ChatType>): ChatType => ({
      antilink: chat.antilink || false,
      ban: chat.ban || false,
      modeadmin: chat.modeadmin || false,
      welcome: chat.welcome || false,
      audios: chat.audios || false,
      antiNsfw: chat.antiNsfw || false,
      antiArabe: chat.antiArabe || false,
      antiSpam: chat.antiSpam || false,
      antiFake: chat.antiFake || false,
      detect: chat.detect || false,
      welcomeMessage: chat.welcomeMessage || ''
    })
    if (m.chat && m.isGroup) {
      const chat: ChatType = globalThis.db.data.chats[m.chat] = Ichat(globalThis.db.data.chats[m.isGroup ? m.chat : null] || {})
    }

    const Isettings = (settings: Partial<SettingType>): SettingType => ({
      botName: settings.botName || '',
      menuImage: settings.menuImage || [],
      urlLinks: settings.urlLinks || '',
      legacyMenu: settings.legacyMenu || false,
      customMenu: settings.customMenu || '',
      antiCalls: settings.antiCalls || false,
      autoread: settings.autoread || false,
    })
    if (jid) {
      const settings: SettingType = globalThis.db.data.settings[jid] = Isettings(globalThis.db.data.settings[jid] || {})
    }
      
    } catch (error) {
      console.error(error)
    }
    return m
}

function patchpassive(user: UserType) {
  let message = ''
  message += `（鋭真圧） ¡Ｆｅｌｉｃｉｄａｄｅｓ！　\nꜱᴜʙɪꜱᴛᴇ ᴀʟ ɴɪᴠᴇʟ ${user.level}⚜\n`
  if (user.especial === 'gambler') {
    user.luck += 1
    user.health = 350

    user.attack += 10

    user.money += user.luck ? user.luck : 100
    message += `ᴄᴏᴍᴏ ɢᴀᴍʙʟᴇʀ. ᴛᴜ ꜱᴜᴇʀᴛᴇ ᴀᴜᴍᴇɴᴛᴀ un ${user.luck}!! 🍀/n${user.attack} ᴀᴛᴀQᴜᴇ ⚔`
  }
  else if (user.especial === 'warrior') {
    user.attack += user.level ? 5 *user.level : 5
    user.defense += user.level ? 5 *user.level : 5
    message += `ᴛᴜ ʜᴀʙɪʟɪᴅᴀᴅ ᴄᴏᴍᴏ ɢᴜᴇʀʀᴇʀᴏ ᴀᴜᴍᴇɴᴛᴀ\n${user.defense} ᴅᴇꜰᴇɴꜱᴀ 🛡\n ${user.attack} ᴀᴛᴀQᴜᴇ ⚔`
  } else {
    message += `ɴᴏ ᴛɪᴇɴᴇꜱ ʜᴀʙɪʟɪᴅᴀᴅ\n ɴᴏ ʀᴇᴄɪʙᴇꜱ ɴᴀᴅᴀ`
  }
  return message

}

