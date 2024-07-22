import { mediaUpload, WAMediaUpload } from "../types/"
import { MessageSerialize } from "../types/"
import makeWASocket, { generateWAMessageContent, ConnectionState, AuthenticationCreds, UserFacingSocketConfig, WACallEvent, Contact, toBuffer, downloadContentFromMessage, jidDecode, generateWAMessageFromContent, proto, BaileysEventMap, AnyMessageContent, WAProto, areJidsSameUser, prepareWAMessageMedia } from "@whiskeysockets/baileys"
import type { conn } from "../types/"
import EventEmitter = require("events")
import { TypedEventEmitter } from "typeorm"
import { fromBuffer } from "file-type"
import { Readable } from "stream"
import { isURL } from "../lib/functions/functions"
import fs from "fs"
import ws from 'ws'
import PhoneNumber from "awesome-phonenumber"
import { message } from "./serialize"
type chats = Record<string, any>


type events = {
  "group.update": (creds: proto.IWebMessageInfo) => void
  "message.upsert": (creds: proto.IWebMessageInfo) => void
  "contacts.update": (creds: Partial<Contact>) => void
  "CB:connect": (creds: Partial<ConnectionState>) => void
  "subbot.connect": (creds: Partial<ConnectionState>) => void
  "creds.update": (creds: Partial<AuthenticationCreds>) => void
  call: (call: WACallEvent) => void
}

export class client extends (EventEmitter as new () => TypedEventEmitter<events>) {
constructor() {
  super()
}

async connect(makeSocketConfig: UserFacingSocketConfig): Promise<void> {
  const conn: conn = makeWASocket({...makeSocketConfig})
  
  conn.ev.on('messages.upsert', async ({messages}) => {
    for (const m of messages) {
      this.emit('message.upsert', m)}
  })
  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      this.emit('call', call)
    }
  })
  conn.ev.on('connection.update', async (up) => {
    this.emit('CB:connect', up) 
  })
  conn.ev.on('creds.update', async (creds) => {
    this.emit('creds.update', creds)
  })
  for(const ev of [
            "messaging-history.set",
            "chats.upsert",
            "chats.update",
            "chats.phoneNumberShare",
            "chats.delete",
            "presence.update",
            "contacts.upsert",
            "contacts.update",
            "messages.delete",
            "messages.update",
            "messages.media-update",
            "messages.reaction",
            "message-receipt.update",
            "groups.upsert",
            "groups.update",
            "group-participants.update",
            "blocklist.set",
            "blocklist.update",
            "label.edit",
            "labels.association",
  ])
  conn.ev?.removeAllListeners(ev as keyof BaileysEventMap)
  for (const key of Object.keys(conn)) {
    this[key as keyof client] = conn[key as keyof conn]
    if(!["ev", "ws"].includes(key)) delete conn[key as keyof conn]}
  }
ws: ws
chats: chats = {}
public sendText = async (jid: string, text: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
return await this.sendMessage(jid, { text: text, ...options }, { quoted: quoted})
}
public fakeReply = async (jid: string, text: string, tag: string, text2: string): Promise<string> => {
  const message = generateWAMessageFromContent(jid, {
    extendedTextMessage: {
        text: text2,
        contextInfo: {
            participant: tag,
            quotedMessage: {
                extendedTextMessage: {
                    text: text2,
                },
            },
        },
    },
  },
    {
      userJid: tag,
    }
  )
  return await this.relayMessage(jid, message.message, {
      messageId: message.key.id,
  })
}
public downloadMediaMessage = async (m: MessageSerialize): Promise<Buffer> => {
       const mime = m.message[m.type].mimetype || ""
        const messageType = mime.split("/")[0]
        const stream = await downloadContentFromMessage(m.message[m.type], messageType)
        return await toBuffer(stream)
}
public downloadAndSaveMediaMessage = async (m: MessageSerialize, folder: string, attachExtension:boolean = true): Promise<string> => {
  const mime = m.message[m.type].mimetype || ""
  const messageType = mime.split("/")[0]
  const pathfile = folder + `/${m.sender.split("@")[0]}_${Date.now()}`
  const stream = await downloadContentFromMessage(m.message[m.type], messageType)
  let buffer = await toBuffer(stream)
  const type = await fromBuffer(buffer)
  const filePath = attachExtension ? pathfile + "." + type.ext : pathfile
  fs.writeFileSync(filePath, buffer)
  buffer = null
  return filePath
}
public decodeJid = async (jid: any): Promise<string> => {
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || ({} as any)
    return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim()
  } else return jid || jid.trim()
}
public sendImage = async (jid: string,  image: mediaUpload, caption: string, quoted: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
 let media: WAMediaUpload
 if (typeof image === 'string' && isURL(image)) {
     media = { url: image }
 } else if (Buffer.isBuffer(image)) {
     media = image
 } else {
     media = { stream: image as unknown as Readable }
 }
 return this.sendMessage(jid, { image: media, caption: caption, ...options }, { quoted: !quoted ? null : quoted })
}
public sendVideo = async (jid: string, video: mediaUpload, caption?: string, gifPlayback?: boolean, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
  let media: WAMediaUpload
        if (typeof video === "string" && isURL(video)) {
            media = { url: video }
        } else if (Buffer.isBuffer(video)) {
            media = video
        } else {
            media = { stream: video as unknown as Readable }
        }
        return this.sendMessage(jid, { video: media, caption: caption, gifPlayback: gifPlayback ? true : false, ...options }, { quoted: !quoted ? null : quoted })
}
public sendAudio = async (jid: string, audio: mediaUpload, ppt: boolean, mimetype: string, quoted: MessageSerialize, options: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
  let media: WAMediaUpload
  if (typeof audio === "string" && isURL(audio)) {
      media = { url: audio }
  } else if (Buffer.isBuffer(audio)) {
      media = audio
  } else {
      media = { stream: audio as unknown as Readable }
  }
  return this.sendMessage(jid, { audio: media, ptt: ppt ? true : false, mimetype: !mimetype ? "audio/mp4" : mimetype,  ...options }, { quoted: !quoted ? null : quoted })
}
public sendReaction = async (jid: string, emoji: string, m: proto.IMessageKey): Promise<WAProto.WebMessageInfo> => {
  return this.sendMessage(jid, { react: { text: emoji, key: m } })
}
public requestPhoneNumber = async (m: MessageSerialize) => {
  const message = generateWAMessageFromContent(m.chat, {
    requestPhoneNumberMessage: {
        contextInfo: {
            participant: m.sender,
        },  
    },
}, {
    userJid: m.sender
})
await this.relayMessage(m.chat, message.message, {
    messageId: message.key.id,
})
}
public getName = async (jid = '', withoutContact: boolean = true) => {
  jid =  await this.decodeJid(jid)
  withoutContact = withoutContact
  let v
  if (jid.endsWith('@g.us')) {
    return new Promise(async (resolve) => {
      v = jid || {}
      if (!(v.name || v.subject)) v = await this.groupMetadata(jid) || {}
      resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
    })
  } else {
    v = jid === '0@s.whatsapp.net' ? {
      jid,
      vname: 'WhatsApp',
    } : areJidsSameUser(jid, this.user.id) ?
    this.user :
              (jid || {})
  }
  return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}
public sendContact = async (
  jid: string,
  contacts: string[],
  quoted?: MessageSerialize,
  options?: Partial<AnyMessageContent>
): Promise<WAProto.WebMessageInfo> => {
  const listContact = []
  for (let i of contacts) {
      const number = i.split("@")[0]
      const pushname = await this.getName(i)
      const awesomeNumber = PhoneNumber("+" + number).getNumber("international")
      listContact.push({
          displayName: pushname,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${pushname}\nFN:${pushname}\nitem1.TELwaid=${number}:${awesomeNumber}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
      })
  }
  return this.sendMessage(
      jid,
      {
          contacts: {
              displayName: `${listContact.length} contacto`,
              contacts: listContact,
          },
          ...options,
      },
      { quoted }
  )
}
public parseMention = async (text: string): Promise<string> => {
  [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
  return text
}
public reply = async (jid: string, text: string, quoted: MessageSerialize): Promise<WAProto.WebMessageInfo> => {
return await this.sendMessage(jid, { text: text }, { quoted: quoted })
}

public requestPairingCode: conn["requestPairingCode"]
public register: conn["register"]
public requestRegistrationCode: conn["requestRegistrationCode"]
public getOrderDetails: conn["getOrderDetails"]
public getCatalog: conn["getCatalog"]
public getCollections: conn["getCollections"]
public productCreate: conn["productCreate"]
public productDelete: conn["productDelete"]
public productUpdate: conn["productUpdate"]
public sendMessageAck: conn["sendMessageAck"]
public sendRetryRequest: conn["sendRetryRequest"]
public rejectCall: conn["rejectCall"]
public getPrivacyTokens: conn["getPrivacyTokens"]
public assertSessions: conn["assertSessions"]
public relayMessage: conn["relayMessage"]
public sendReceipt: conn["sendReceipt"]
public sendReceipts: conn["sendReceipts"]
public getButtonArgs: conn["getButtonArgs"]
public readMessages: conn["readMessages"]
public refreshMediaConn: conn["refreshMediaConn"]
public waUploadToServer: conn["waUploadToServer"]
public fetchPrivacySettings: conn["fetchPrivacySettings"]
public updateMediaMessage: conn["updateMediaMessage"]
public sendMessage: conn["sendMessage"]
public groupMetadata: conn["groupMetadata"]
public groupCreate: conn["groupCreate"]
public groupLeave: conn["groupLeave"]
public groupUpdateSubject: conn["groupUpdateSubject"]
public groupRequestParticipantsList: conn["groupRequestParticipantsList"]
public groupRequestParticipantsUpdate: conn["groupRequestParticipantsUpdate"]
public groupParticipantsUpdate: conn["groupParticipantsUpdate"]
public groupUpdateDescription: conn["groupUpdateDescription"]
public groupInviteCode: conn["groupInviteCode"]
public groupRevokeInvite: conn["groupRevokeInvite"]
public groupAcceptInvite: conn["groupAcceptInvite"]
public groupAcceptInviteV4: conn["groupAcceptInviteV4"]
public groupGetInviteInfo: conn["groupGetInviteInfo"]
public groupToggleEphemeral: conn["groupToggleEphemeral"]
public groupSettingUpdate: conn["groupSettingUpdate"]
public groupMemberAddMode: conn["groupMemberAddMode"]
public groupJoinApprovalMode: conn["groupJoinApprovalMode"]
public groupFetchAllParticipating: conn["groupFetchAllParticipating"]
public processingMutex: conn["processingMutex"]
public upsertMessage: conn["upsertMessage"]
public appPatch: conn["appPatch"]
public sendPresenceUpdate: conn["sendPresenceUpdate"]
public presenceSubscribe: conn["presenceSubscribe"]
public profilePictureUrl: conn["profilePictureUrl"]
public onWhatsApp: conn["onWhatsApp"]
public fetchBlocklist: conn["fetchBlocklist"]
public fetchStatus: conn["fetchStatus"]
public updateProfilePicture: conn["updateProfilePicture"]
public removeProfilePicture: conn["removeProfilePicture"]
public updateProfileStatus: conn["updateProfileStatus"]
public updateProfileName: conn["updateProfileName"]
public updateBlockStatus: conn["updateBlockStatus"]
public updateLastSeenPrivacy: conn["updateLastSeenPrivacy"]
public updateOnlinePrivacy: conn["updateOnlinePrivacy"]
public updateProfilePicturePrivacy: conn["updateProfilePicturePrivacy"]
public updateStatusPrivacy: conn["updateStatusPrivacy"]
public updateReadReceiptsPrivacy: conn["updateReadReceiptsPrivacy"]
public updateGroupsAddPrivacy: conn["updateGroupsAddPrivacy"]
public updateDefaultDisappearingMode: conn["updateDefaultDisappearingMode"]
public getBusinessProfile: conn["getBusinessProfile"]
public resyncAppState: conn["resyncAppState"]
public chatModify: conn["chatModify"]
public cleanDirtyBits: conn["cleanDirtyBits"]
public addChatLabel: conn["addChatLabel"]
public removeChatLabel: conn["removeChatLabel"]
public addMessageLabel: conn["addMessageLabel"]
public removeMessageLabel: conn["removeMessageLabel"]
public star: conn["star"]
public type: conn["type"]

public authState: conn["authState"]
public signalRepository: conn["signalRepository"]
public user: conn["user"]
public generateMessageTag: conn["generateMessageTag"]
public query: conn["query"]
public waitForMessage: conn["waitForMessage"]
public waitForSocketOpen: conn["waitForSocketOpen"]
public sendRawMessage: conn["sendRawMessage"]
public sendNode: conn["sendNode"]
public logout: conn["logout"]
public end: conn["end"]
public onUnexpectedError: conn["onUnexpectedError"]
public uploadPreKeys: conn["uploadPreKeys"]
public uploadPreKeysToServerIfRequired: conn["uploadPreKeysToServerIfRequired"]
public waitForConnectionUpdate: conn["waitForConnectionUpdate"]


}
