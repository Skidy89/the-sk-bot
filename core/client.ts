import { mediaUpload, WAMediaUpload } from "../types/"
import { MessageSerialize } from "../types/"
import makeWASocket, { ConnectionState, AuthenticationCreds, UserFacingSocketConfig, WACallEvent, Contact, toBuffer, downloadContentFromMessage, jidDecode, generateWAMessageFromContent, proto, BaileysEventMap, AnyMessageContent, WAProto, areJidsSameUser, prepareWAMessageMedia, GroupMetadata, useMultiFileAuthState, fetchLatestBaileysVersion, WAMessageKey, BufferJSON } from "@whiskeysockets/baileys"
import type { conn } from "../types/"
import EventEmitter = require("events")
import { TypedEventEmitter } from "typeorm"
import { fromBuffer } from "file-type"
import { Readable } from "stream"
import { isURL, store } from "../lib/functions/functions"
import fs from "fs"
import ws from 'ws'
import { parsePhoneNumber } from "awesome-phonenumber"
import { format } from "util"


type events = {
  "group.update": (creds: proto.IWebMessageInfo) => void
  "message.upsert": (creds: proto.IWebMessageInfo) => void
  "contacts.update": (creds: Partial<Contact>) => void
  "CB:connect": (creds: Partial<ConnectionState>) => void
  "subbot.connect": (creds: Partial<ConnectionState>) => void
  "creds.update": (creds: Partial<AuthenticationCreds>) => void
  "messages.delete": (creds: proto.IMessageKey) => void
  call: (call: WACallEvent) => void
}
/**
 * the client for WAevents
 * uses EventEmitter
 */
export class client extends (EventEmitter as new () => TypedEventEmitter<events>) {
constructor() {
  super()
}
/**
 * Like MakeWASocket
 * @param makeSocketConfig 
 * import makeWASocket from "@WhiskeySockets/baileys"
 * see more on https://github.com/WhiskeySockets
 */
async connect(makeSocketConfig: UserFacingSocketConfig): Promise<void> {
  const conn = makeWASocket({...makeSocketConfig})
  store.bind(conn.ev)
  console.info = () => {}
  conn.ev.on('messages.delete', async delet => {
    this.emit('messages.delete', delet as any)
  })
  conn.ev.on('messages.upsert', async ({messages}) => {
    
    for (const message of messages) {
          if (message.messageStubParameters != undefined && message.messageStubParameters[0] === "Message absent from node") {
        await this.sendMessageAck(JSON.parse(message.messageStubParameters[1], BufferJSON.reviver));
      }
      if (message.message?.protocolMessage?.type === 3 || message?.messageStubType) {
          this.emit("group.update", message);
      } else {
          this.emit("message.upsert", message);
      }
    }
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

/**
 * send a text
 * @param jid 
 * @param text 
 * @param quoted 
 * @param options 
 * @returns 
 */
public sendText = async (jid: string, text: string, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
return await this.sendMessage(jid, { text: text, ...options }, { quoted: quoted})
}
/**
 * fake replys
 * @param jid 
 * @param text 
 * @param tag 
 * @param text2 
 * @returns 
 */
public fakeReply = async (jid: string, text: string, tag: string, text2: string): Promise<string> => {
  const message = generateWAMessageFromContent(jid, {
    extendedTextMessage: {
        text: text,
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
/**
 * save downloads in memory
 * @param m 
 * @returns 
 */
public downloadMediaMessage = async (m: MessageSerialize): Promise<Buffer> => {
       const mime = m.msg.mimetype || ""
        const messageType = mime.split("/")[0]
        const stream = await downloadContentFromMessage(m.msg, messageType)
        return await toBuffer(stream)
}
/**
 * save media from message
 * @param m 
 * @param folder 
 * @param attachExtension 
 * @returns 
 */
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
/**
 * decode the jid from user
 * @param jid 
 * @returns xyz@s.whatsapp.net
 */
public decodeJid = async (jid: any) => {
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || ({} as any)
    return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim()
  } else return jid || jid.trim()
}
/**
 * send a image from buffer/url
 * @param jid 
 * @param image 
 * @param caption 
 * @param quoted 
 * @param options 
 * @returns 
 * kinda bug
 */
public sendImage = async (jid: string,  image: mediaUpload, caption: string, quoted: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
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
/**
 * send a video from buffer/url
 * @param jid 
 * @param video 
 * @param caption 
 * @param gifPlayback 
 * @param quoted 
 * @param options 
 * @returns 
 * kinda bug too
 */
public sendVideo = async (jid: string, video: mediaUpload, caption?: string, gifPlayback?: boolean, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
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
/**
 * send a audio!!
 * @param jid 
 * @param audio 
 * @param ppt 
 * @param mimetype 
 * @param quoted 
 * @param options 
 * @returns 
 */
public sendAudio = async (jid: string, audio: mediaUpload, ppt: boolean, mimetype: string, quoted: proto.IWebMessageInfo, options: Partial<AnyMessageContent>): Promise<WAProto.WebMessageInfo> => {
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
/**
 * send a reaction!!
 * @param jid 
 * @param emoji 
 * @param m 
 * @returns 
 */
public sendReaction = async (jid: string, emoji: string, m: proto.IMessageKey): Promise<WAProto.WebMessageInfo> => {
  return this.sendMessage(jid, { react: { text: emoji, key: m } })
}
/**
 * 
 * @param jid 
 * @param withoutContact 
 * @returns 
 */
public getName = async (jid = '', withoutContact: boolean = true) => {
  jid =  await this.decodeJid(jid)
  withoutContact = withoutContact
  let v
  if (jid.endsWith('@g.us')) {
    return new Promise(async (resolve) => {
      v = jid || {}
      if (!(v.name || v.subject)) v = await this.groupMetadata(jid) || {}
      resolve(v.name || v.subject || parsePhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
    })
  } else {
    v = jid === '0@s.whatsapp.net' ? {
      jid,
      vname: 'WhatsApp',
    } : areJidsSameUser(jid, this.user.id) ?
    this.user :
              (jid || {})
  }
  return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || parsePhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}
/**
 * 
 * @param jid 
 * @param contacts 
 * @param quoted 
 * @param options 
 * @returns 
 */
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
      const awesomeNumber = parsePhoneNumber("+" + number).getNumber("international")
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
/**
 * its like normal one. useless
 * @deprecated use sendText() instead
 */
public reply = async (jid: string, text: string, quoted: proto.IWebMessageInfo): Promise<WAProto.WebMessageInfo> => {
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
