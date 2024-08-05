import { client } from "../client"
import { ChatType, low, MessageSerialize, SettingType, UserType } from "../../types"
import { proto, WAMessage, AnyMessageContent, MessageType } from "@whiskeysockets/baileys"
export const expToLevelUp = (level: number) => Math.floor(100 * Math.pow(1.5, level))
declare var globalThis: {
  db: low
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
        m.sender =  m.key.fromMe ? (sock.user.id.split(":")[0]+'@s.whatsapp.net' || sock.user.id) : (message.key.participant || message.key.remoteJid)
        m.message = message.message
        m.type = Object.keys(m.message)[0] as MessageType
        m.isNewsLetter = m.chat.endsWith('@newsletter')
        m.body = m.type === "conversation" ? m.message.conversation : m.type === "extendedTextMessage" ? m.message[m.type].text : m.type === "imageMessage" ? m.message[m.type].caption : m.type === "videoMessage" ? m.message[m.type].caption : m.type === "locationMessage" ? m.message[m.type].comment : m.type === "listResponseMessage" ? m.message[m.type].singleSelectReply.selectedRowId : m.type === "templateButtonReplyMessage" && m.message.templateButtonReplyMessage ? m.message[m.type].selectedId : m.type === "buttonsResponseMessage" ? m.message[m.type].selectedButtonId : m.type === "reactionMessage" ? m.message[m.type].text : m.type === "documentMessage" ? m.message[m.type]?.caption || "Document Message" : m.type === "audioMessage" ? "Audio Message" : m.type === "stickerMessage" ? "Sticker Message" : m.type === "contactMessage" ? "Contact Message" : m.type === "productMessage" ? "Product Message" : m.type === "pollCreationMessage" ? "Poll Message" : m.type === "protocolMessage" ? "Protocol Message" : m.type === "buttonsMessage" ? "Buttons Message" : m.type === "listMessage" ? "List Message" : m.type === 'botInvokeMessage' ? 'bot Invoke Message' : 'undetected'
        m.args = m.body.trim().split(/ +/).slice(1)
        m.arg = m.body.substring(m.body.indexOf(" ") + 1)
        m.messageTimestamp = message.messageTimestamp
        m.isBroadcast = message.broadcast
        if (m?.message?.interactiveResponseMessage) {
          const paramsJson = m?.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson
          if (paramsJson) {
          const params = JSON.parse(paramsJson)
          m.body = params.id
          }
        }
        

        if (m.type == 'protocolMessage' && m.message[m.type].key) { 
            protocolMessageKey = m.message[m.type].key 
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat 
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender 
            protocolMessageKey.fromMe = sock.decodeJid(protocolMessageKey.participant) === sock.decodeJid(sock.user.id) 
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === sock.decodeJid(sock.user.id)) protocolMessageKey.remoteJid = m.sender 
        }
        if (m.type === 'viewOnceMessage') {
          m.message = m.message[m.type]?.message
          m.type =  Object.keys(m.message)[0]
        }
        if (m.type === 'ephemeralMessage') {
          m.message = m.message[m.type]?.message
          const type = Object.keys(m.message)[0]
          m.type = type
          if (type === 'viewOnceMessage') {
            m.message = m.message[m.type]?.message
            m.type = Object.keys(m.message)[0]
          }
        }
        if (m.type === "ephemeralMessage") {
          m.message = m.message[m.type].message;
          const tipe = Object.keys(m.message)[0];
          m.type = tipe;
          if (tipe === "viewOnceMessageV2") {
              m.message = m.message[m.type].message;
              m.type = Object.keys(m.message)[0];
          }
       }
        if (m.type === "viewOnceMessageV2") {
          m.message = m.message[m.type].message;
          m.type = Object.keys(m.message)[0];
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
            m.pushname = message.pushName || message.verifiedBizName || 'unknown'
            m.reply = async (text: string, jid?: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => await sock.sendMessage(jid ? jid : m.chat, { text: text, ...options }, { quoted: quoted ? quoted : m })

            if (m.message[m.type]?.url) m.download = () => sock.downloadMediaMessage(m.message[m.type])
                m.text = m.message[m.type]?.text || m.message[m.type]?.caption || m.message?.conversation || m.message[m.type]?.contentText || m.message[m.type]?.selectedDisplayText || m.message[m.type]?.title || m.message[m.type]?.interactiveMessage || ''
    }
    
    const jid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    try {
      const isNumber = (x: any): x is number => typeof x === 'number' && !isNaN(x)
      const Iuser = (user: Partial<UserType>): UserType => ({
        name:  user.name || m.pushname,
        turnAbility: isNumber(user.turnAbility) ? user.turnAbility : 0,
        health: isNumber(user.health) ? user.health : 100,
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
        petLevel: isNumber(user.petLevel) ? user.petLevel : 0,
        petHealth: isNumber(user.petHealth) ? user.petHealth : 0,
        attack: isNumber(user.attack) ? user.attack : 10,
        defense: isNumber(user.defense) ? user.defense : 0,
        speed: isNumber(user.speed) ? user.speed : 0,
        potion: isNumber(user.potion) ? user.potion : 0,
        money: isNumber(user.money) ? user.money : 0,
        bow: isNumber(user.bow) ? user.bow : 0,
        sword: isNumber(user.sword) ? user.sword : 0,
        limit: isNumber(user.limit) ? user.limit : 0,
        lastClaim: isNumber(user.lastClaim) ? user.lastClaim : 0,
        lastDaily: isNumber(user.lastDaily) ? user.lastDaily : 0,
        lastStreak: isNumber(user.lastStreak) ? user.lastStreak : 0,
        lastWork: isNumber(user.lastWork) ? user.lastWork : 0,
        lastRob: isNumber(user.lastRob) ? user.lastRob : 0,
        armor: isNumber(user.armor) ? user.armor : 0,
        armorDurability: isNumber(user.armorDurability) ? user.armorDurability : 0,
        pickaxe: isNumber(user.pickaxe) ? user.pickaxe : 0,
        pickaxeDurability: isNumber(user.pickaxeDurability) ? user.pickaxeDurability : 0,
        swordDurability: isNumber(user.swordDurability) ? user.swordDurability : 0,
        shield: isNumber(user.shield) ? user.shield : 0,
        shieldDurability: isNumber(user.shieldDurability) ? user.shieldDurability : 0,
        deaths: isNumber(user.deaths) ? user.deaths : 0,
        lastAventure: isNumber(user.lastAventure) ? user.lastAventure : 0,
      })
    const user: UserType = globalThis.db.data.users[m.sender] = Iuser(globalThis.db.data.users[m.sender] || {})
    if (user) {
      if (user.health > 100 && user.especial === 'warrior' || user.especial === 'ninguno') user.health = 100
      if (user.health > 350 && user.especial === 'gambler') user.health = 350
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
      const passiveWarrior = (user: UserType) => {
        const regenInterval = 5 * 60 * 60 * 1000
        const regenAmount = 10
    
        const regen = setInterval(() => {
          if (user.health >= 100) {
            clearInterval(regen)
          } else {
            user.health = Math.min(user.health + regenAmount, 100)
          }
        }, regenInterval)
    
        return regen
      }
      
      if (user.exp >= expNeeded) {
        user.level += 1
        user.exp = 0
        sock.sendMessage(m.chat, { text: patchpassive(user) })
      }
      if (user.especial === 'gambler') {
        user.defense = 0
        if (user.luck > 100) user.luck = 100
      }
      let Ipassive
      if (user.especial === 'warrior') {
        if (user.health >= 100) return
        Ipassive = passiveWarrior(user)
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
    const chat: ChatType = globalThis.db.data.chats[m.chat] = Ichat(globalThis.db.data.chats[m.chat] || {})

    const Isettings = (settings: Partial<SettingType>): SettingType => ({
      botName: settings.botName || '',
      menuImage: settings.menuImage || [],
      urlLinks: settings.urlLinks || '',
      antiCalls: settings.antiCalls || false,
      autoread: settings.autoread || false,
    })
    const settings: SettingType = globalThis.db.data.settings[jid] = Isettings(globalThis.db.data.settings[jid] || {})
      
    } catch (error) {
      console.error(error)
    }
    return m
}

function patchpassive(user: UserType) {
  let message = ''
  message += `（鋭真圧） ¡Ｆｅｌｉｃｉｄａｄｅｓ！　\nꜱᴜʙɪꜱᴛᴇ ᴀʟ ɴɪᴠᴇʟ ${user.level}⚜\n`
  if (user.especial === 'gambler') {
    const luck = user.level <= 100 ? user.level * 0.1 : 10
    user.luck += luck
    user.health = 350

    user.attack += 10

    user.money += user.luck ? user.luck : 100
    message += `ᴄᴏᴍᴏ ɢᴀᴍʙʟᴇʀ. ᴛᴜ ꜱᴜᴇʀᴛᴇ ᴀᴜᴍᴇɴᴛᴀ un ${luck.toFixed(2)}!! 🍀/n${user.attack} ᴀᴛᴀQᴜᴇ ⚔`
  }
  else if (user.especial === 'warrior') {
    user.attack += user.level ? 5 *user.level : 5
    user.defense += user.level ? 5 *user.level : 5
    message += `ᴛᴜ ʜᴀʙɪʟɪᴅᴀᴅ ᴄᴏᴍᴏ ɢᴜᴇʀʀᴇʀᴏ ᴀᴜᴍᴇɴᴛᴀ\n${user.defense} ᴅᴇꜰᴇɴꜱᴀ 🛡\n ${user.attack} ᴀᴛᴀQᴜᴇ ⚔`
  }
  else if (user.especial === 'ninguna') {
    message += `ɴᴏ ᴛɪᴇɴᴇꜱ ʜᴀʙɪʟɪᴅᴀᴅ\n ɴᴏ ʀᴇᴄɪʙᴇꜱ ɴᴀᴅᴀ`
  }
  return message

}