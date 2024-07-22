import { client } from "../client"
import { MessageSerialize } from "../../types"
import { proto, WAMessage, downloadMediaMessage, AnyMessageContent, getContentType } from "@whiskeysockets/baileys"
type UserType = {
  registered: boolean
  name: string
  age: number
  regTime: number
  afkTime: number
  afkReason: string
  limit: number
  money: number
  health: number
  warn: number
  exp: number
  role: string
  level: number
  armor: number
  sword: number
  pickaxe: number
  axe: number
  gems: number
  gold: number
  copper: number
  lastmiming: number
  robs: number
  lastclaim: number
  diamonds: number
  swordDurability: number
  pickaxeDurability: number
  axeDurability: number
  armorDurability: number
  lastMining: number
  potion: number
  rock: number
  iron: number
  trash: number
  totalAttacks: number
  totalDamageDealt: number
}

type ChatType = {
  antilink: boolean
  ban: boolean
  modeadmin: boolean
  welcome: boolean
  audios: boolean
  antiNsfw: boolean
  antispam: boolean
  antiFake: boolean
  antiArabe: boolean
  detect: boolean
}

type SettingType = {
  status: number
  botname: string
  autobio: boolean
  jadibot: boolean
  antiCall: boolean
  privado: boolean
}


export type DatabaseType = {
  users: { [key: string]: UserType }
  chats: { [key: string]: ChatType }
  settings: { [key: string]: SettingType }
  sticker: any
}


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
        m.type = getContentType(m.message)
        m.msg =  m.message[m.type]
        m.body = m.type === "conversation" ? m.message.conversation : m.type === "extendedTextMessage" ? m.message[m.type].text : m.type === "imageMessage" ? m.message[m.type].caption : m.type === "videoMessage" ? m.message[m.type].caption : m.type === "locationMessage" ? m.message[m.type].comment : m.type === "listResponseMessage" ? m.message[m.type].singleSelectReply.selectedRowId : m.type === "templateButtonReplyMessage" && m.message.templateButtonReplyMessage ? m.message[m.type].selectedId : m.type === "buttonsResponseMessage" ? m.message[m.type].selectedButtonId : m.type === "reactionMessage" ? m.message[m.type].text : m.type === "documentMessage" ? m.message[m.type]?.caption || "Document Message" : m.type === "audioMessage" ? "Audio Message" : m.type === "stickerMessage" ? "Sticker Message" : m.type === "contactMessage" ? "Contact Message" : m.type === "productMessage" ? "Product Message" : m.type === "pollCreationMessage" ? "Poll Message" : m.type === "protocolMessage" ? "Protocol Message" : m.type === "buttonsMessage" ? "Buttons Message" : m.type === "listMessage" ? "List Message" : "-"
        m.args = m.body.trim().split(/ +/).slice(1)
        m.arg = m.body.substring(m.body.indexOf(" ") + 1)

        if (m.type == 'protocolMessage' && m.msg.key) { 
            protocolMessageKey = m.msg.key 
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat 
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender 
            protocolMessageKey.fromMe = sock.decodeJid(protocolMessageKey.participant) === sock.decodeJid(sock.user.id) 
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === sock.decodeJid(sock.user.id)) protocolMessageKey.remoteJid = m.sender 
        }
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (quoted) {
            m.quoted.message = m.message[m.type].contextInfo.quotedMessage
            m.quoted.type = getContentType(m.quoted.message)
            m.quoted.delete = async () => {
              let vM = proto.WebMessageInfo.fromObject({
                key: {
                  remoteJid: m.msg.contextInfo.remoteJid || m.chat,
                  fromMe: m.msg.contextInfo.participant.split(':')[0] === (sock.user && sock.user.id),
                  id: m.msg.contextInfo.stanzaId
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.msg.contextInfo.participant } : {})
              })
              await sock.sendMessage(m.msg.contextInfo.remoteJid || m.chat, { delete: vM.key })
            }
            m.quoted.download = async () => {
              return (await downloadMediaMessage(
                { key: m.msg.key, message: m.quoted.message },
                'buffer',
                {}
            )) as Buffer
            }}
            m.pushname = message.pushName || 'unknown'
            m.reply = async (text: string, jid?: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => await sock.sendMessage(jid ? jid : m.chat, { text: text, ...options }, { quoted: quoted ? quoted : m })

            if (m.msg.url) m.download = () => sock.downloadMediaMessage(m.msg)
                m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
    }
    global.db.data = global.db.data || {} as DatabaseType
    const jid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    try {
      const isNumber = (x: any): x is number => typeof x === 'number' && !isNaN(x)
      
      let user = global.db.data.users[m.sender]
      if (typeof user !== 'object') global.db.data.users[m.sender] = {} as UserType
      if (user) {
        if (!('registered' in user)) user.registered = false
        if (!user.registered) {
          if (!('name' in user)) user.name = m.pushname
          if (!isNumber(user.age)) user.age = -1
          if (!isNumber(user.regTime)) user.regTime = -1
        }
        if (!isNumber(user.afkTime)) user.afkTime = -1
        if (!('afkReason' in user)) user.afkReason = ''
        if (!isNumber(user.limit)) user.limit = 20
        if (!isNumber(user.money)) user.money = 50
        if (!isNumber(user.health)) user.health = 100
        if (!isNumber(user.warn)) user.warn = 0
        if (!isNumber(user.exp)) user.exp = 0
        if (!isNumber(user.role)) user.role = 'Novato I'
        if (!isNumber(user.level)) user.level = 1
        if (!isNumber(user.armor)) user.armor = 0
        if (!isNumber(user.sword)) user.sword = 0
        if (!isNumber(user.pickaxe)) user.pickaxe = 0
        if (!isNumber(user.axe)) user.axe = 0
        if (!isNumber(user.gems)) user.gems = 0
        if (!isNumber(user.gold)) user.gold = 0
        if (!isNumber(user.copper)) user.copper = 0
        if (!isNumber(user.lastmiming)) user.lastmiming = 0
        if (!isNumber(user.robs)) user.robs = 0
        if (!isNumber(user.lastclaim)) user.lastclaim = 0
        if (!isNumber(user.diamonds)) user.diamonds = 0
        if (!isNumber(user.swordDurability)) user.swordDurability = 100
        if (!isNumber(user.pickaxeDurability)) user.pickaxeDurability = 100
        if (!isNumber(user.axeDurability)) user.axeDurability = 100
        if (!isNumber(user.armorDurability)) user.armorDurability = 100
        if (!isNumber(user.lastMining)) user.lastMining = 0
        if (!isNumber(user.potion)) user.potion = 0
        if (!isNumber(user.rock)) user.rock = 0
        if (!isNumber(user.iron)) user.iron = 0
        if (!isNumber(user.trash)) user.trash = 0
        if (!isNumber(user.totalAttacks)) user.totalAttacks = 0
        if (!isNumber(user.totalDamageDealt)) user.totalDamageDealt = 0
      } else {
        global.db.data.users[m.sender] = {
          registered: false,
          name: m.pushname,
          age: -1,
          regTime: -1,
          afkTime: -1,
          afkReason: '',
          limit: 20,
          money: 50,
          health: 100,
          warn: 0,
          exp: 0,
          role: 'Novato I',
          level: 1,
          armor: 0,
          sword: 0,
          pickaxe: 0,
          axe: 0,
          gems: 0,
          gold: 0,
          copper: 0,
          lastmiming: 0,
          robs: 0,
          lastclaim: 0,
          diamonds: 0,
          swordDurability: 100,
          pickaxeDurability: 100,
          axeDurability: 100,
          armorDurability: 100,
          lastMining: 0,
          potion: 0,
          rock: 0,
          iron: 0,
          trash: 0,
          totalAttacks: 0,
          totalDamageDealt: 0,
        }
      }
      if (user) {
        if (user.health < 0) user.health = 0
        const expToLevelUp = (level: number) => Math.floor(100 * Math.pow(1.5, level))
        const expNeeded = expToLevelUp(user.level)
        if (user.exp >= expNeeded) {
          user.exp -= expNeeded
          user.level += 1
          sock.sendMessage(m.chat, { text: `¡Felicidades! @${m.sender.split("@")[0]} Has alcanzado el nivel ${user.level}`, mentions: [m.sender] }, { quoted: m})
        }

      }
      let setting = global.db.data.settings[jid]
      let chats = global.db.data.chats[m.chat]
      if (typeof chats !== 'object') global.db.data.chats[m.chat] = {} as ChatType
  if (chats) {
    if (!('antilink' in chats)) chats.antilink = false
    if (!('ban' in chats)) chats.ban = false
    if (!('modeadmin' in chats)) chats.modeadmin = false
    if (!('welcome' in chats)) chats.welcome = true
    if (!('audios' in chats)) chats.audios = true
    if (!('antiNsfw' in chats)) chats.antiNsfw = true
    if (!('antispam' in chats)) chats.antispam = true
    if (!('antiFake' in chats)) chats.antiFake = false
    if (!('antiArabe' in chats)) chats.antiArabe = false
    if (!('detect' in chats)) chats.detect = true
  } else {
    global.db.data.chats[m.chat] = {
      antilink: false,
      ban: false,
      modeadmin: false,
      welcome: true,
      audios: true,
      antiNsfw: true,
      antispam: true,
      antiFake: false,
      antiArabe: false,
      detect: true,
    }
  }
      
      if (typeof setting !== 'object') {
        setting = {
          status: 0,
          autobio: true,
          jadibot: true,
          antiCall: true,
          privado: false,
          botname: '',
        }
        global.db.data.settings[jid] = setting
      } else {
        if (!isNumber(setting.status)) setting.status = 0
        if (!('autobio' in setting)) setting.autobio = true
        if (!('jadibot' in setting)) setting.jadibot = true
        if (!('antiCall' in setting)) setting.antiCall = true
        if (!('privado' in setting)) setting.privado = false
        if (!('botname' in setting)) setting.botname = ''}

      
    

    
      global.db.data.sticker = global.db.data.sticker || {}
    } catch (error) {
      console.error(error)
    }
    return m
}
