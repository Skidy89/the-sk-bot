import makeWASocket, { AnyMessageContent, BufferJSON, DisconnectReason, downloadContentFromMessage, generateWAMessageFromContent, GroupMetadata, jidDecode, makeCacheableSignalKeyStore, proto, toBuffer, useMultiFileAuthState, UserFacingSocketConfig } from '@whiskeySockets/baileys';
import { bot, conn, mediaUpload, MessageSerialize, WAMediaUpload } from "../types";
import chalk from "chalk";
import { getRandom, isURL, sleep, store } from "../lib/functions/functions";
import { cache, dataSessions, metadataCache, serialize } from ".";
import { handle, welcomes } from "../handler";
import pino from "pino";
import fs from 'fs'
import { Boom } from "@hapi/boom";
import qrcode from 'qrcode';
import { Readable } from "stream";
import ws from 'ws';
import { fromBuffer } from "file-type";

const messageQueue = []

export const getMain = (name: string): bot | undefined => {
    for (const session of dataSessions.values()) {
        if (session.isMain === true) {
          return session
        }
      }
      return undefined
}
export function getSockets(): string[] {
    const socketActive: string[] = []

    dataSessions.forEach((session, name) => {
        if (session.socket?.ws.socket) {
          if (session.isMain === true) {
            socketActive.push(name + ' (main)')
          } else {
            socketActive.push(name)
          }
        }
    })

    return socketActive
}

export class client {
    constructor() {}
    async connect(config: Partial<UserFacingSocketConfig>, name: string, isMain: boolean, pairingCode?: boolean, m?: MessageSerialize): Promise<void> {
      const path = isMain ? './auth' : './jadibot/' + name
      const { saveCreds, state } = await useMultiFileAuthState(path)
      const conn: conn = makeWASocket({auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }).child({ level: "silent" })) },...config})

      Object.assign(this, conn)
      let sessions = dataSessions.get(name)
      let allGroupMetadata: Record<string, GroupMetadata>
      if (!sessions) {
        sessions = {
          auth: path,
          isMain: isMain,
          socket: this as unknown as client,
          groupsMetadata: allGroupMetadata,
      }
      dataSessions.set(name, sessions)     
      }
      
      
      let isInit
      if (sessions && sessions.socket) {
        store.bind(sessions.socket.ev)
     

      sessions.socket.ev.on('messages.upsert', async (chatUpdate) => {
          for (const message of chatUpdate.messages) {
              if (message.messageStubParameters != undefined && message.messageStubParameters[0] === "Message absent from node") await sessions.socket.sendMessageAck(JSON.parse(message.messageStubParameters[1], BufferJSON.reviver))
              if (message.message?.protocolMessage?.type === 3 || message?.messageStubType) return await welcomes(this, message)
              serialize.message(sessions.socket, message).then((serialize: MessageSerialize) => {
              handle(this, serialize)})
          }
      })
      
      

      sessions.socket.ev.on('connection.update', async (update) => {
          const { lastDisconnect, qr, connection, isNewLogin, receivedPendingNotifications } = update
          if (isNewLogin) isInit = false
          const reason = new Boom(lastDisconnect?.error)?.output.statusCode
          if (isMain) {
              const main = getMain(name) 
              if (pairingCode) throw new Error('pairing code its not supported in main sessions!!')
              if (receivedPendingNotifications && !sessions.socket.authState.creds?.myAppStateKeyId ) {
                  sessions.socket.ev.flush()
              }
              if (qr !== undefined) {
                console.log(chalk.greenBright('[INFO] ') +` escanea este qr para registrar a ${name} como bot principal`)
              }
              if (connection === 'close') {
                if (reason === 405) {
                  fs.unlinkSync(path + 'creds.json')
                  console.log(chalk.redBright('[ERROR] ') + `algo fallo en la autenticacion de ${name}... reiniciando`)
                  process.exit(0)
                } else if (reason === DisconnectReason.restartRequired) {
                  console.log(chalk.greenBright('[CLIENT] ') + `el bot ${name} nesesita reiniciar, reiniciando...`)
                  await this.connect(config, name, isMain, pairingCode).catch((error) => console.log(error))
                } else if (reason === DisconnectReason.timedOut) {
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} su conexion expiro, reiniciando...`)
                  await this.connect(config, name, isMain, pairingCode).catch((error) => console.log(error))
                } else if (reason === DisconnectReason.loggedOut) {
                  fs.unlinkSync(path + 'creds.json')
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} se ha desconectado!!`)
                } else if (reason === DisconnectReason.badSession) {
                  fs.unlinkSync(path + 'creds.json')
                  console.log(chalk.yellowBright('[CLIENT] ') + `el session de ${name} esta corrupta!!`)
                } else if (reason === DisconnectReason.connectionClosed) {
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} fue cerrada!!`)
                  await this.connect(config, name, isMain, pairingCode).catch((error) => console.log(error))
                } else if (reason === DisconnectReason.connectionLost) {
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} perdio la conexion!! reiniciando...`)
                  await this.connect(config, name, isMain, pairingCode).catch((error) => console.log(error))
                } else if (reason === DisconnectReason.connectionReplaced) {
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} la conexion fue remplazada`)
                } else {
                  console.log(chalk.yellowBright('[CLIENT] ') + `el bot ${name} se desconecto por un error inesperado!!. reiniciando...`)
                  await this.connect(config, name, isMain, pairingCode).catch((error) => console.log(error))
                }}
                if (connection === 'open') {
                  console.log(chalk.greenBright('[CLIENT] ') + `el bot ${name} se conecto con exito!!`)
                  globalThis.main = sessions.socket.decodeJid(sessions.socket.user.id)
                  if (!main.groupsMetadata)await main.socket.groupFetchAllParticipating().then((data)=>{ main.groupsMetadata = data})
                }
              } else if (!isMain) {  
                const main = getMain(name)    
                if (!main || !main.socket) throw new Error('no main socket found!!')
                if (qr && !pairingCode) {
                  main.socket.sendImage(m.chat, await qrcode.toBuffer(qr, { scale: 8}), 'qr code', m)
                }
                if  (pairingCode && qr) {
                  main.socket.sendText(m.chat, 'en breve recibiras tu codigo', m)
                  const code = await sessions.socket.requestPairingCode(m.sender.split('@')[0])
                  await sleep(5000)
                  main.socket.sendText(m.chat, code, m)
                }    
                if (update.connection === 'close') {
                  
                  let reason = new Boom(update.lastDisconnect?.error)?.output.statusCode
                  if (reason === 405) {
                      fs.unlinkSync(path + '/creds.json')
                      main.socket.sendText(m.chat, `❗️ algo fallo en la autenticacion de @${name}\nReenvia el comando`, m, { mentions: [m.sender] })
                  } else if (reason === DisconnectReason.restartRequired) {
                      await this.connect(config, m.sender.split('@')[0], false, pairingCode, m).catch((error) => console.log(error))
                  } else if (reason === DisconnectReason.timedOut) {
                      main.socket.sendText(m.chat, `el bot @${name} su conexion expiro, reiniciando...`, m, { mentions: [m.sender] })
                      await this.connect(config, m.sender.split('@')[0], false, pairingCode, m).catch((error) => console.log(error))
                  } else if (reason === DisconnectReason.loggedOut) {
                      fs.unlinkSync(path + '/creds.json')
                      main.socket.sendText(m.chat, `el bot @${name} se ha desconectado!!`, m, { mentions: [m.sender] })
                  } else if (reason === DisconnectReason.badSession) {
                      main.socket.sendText(m.chat, `el session de @${name} esta corrupta!!`, m, { mentions: [m.sender] })
                  } else if (reason === DisconnectReason.connectionClosed) {
                      main.socket.sendText(m.chat, `la conexion de @${name} fue cerrada!!`, m, { mentions: [m.sender] })
                      await this.connect(config, m.sender.split('@')[0], false, pairingCode, m).catch((error) => console.log(error))
                  } else if (reason === DisconnectReason.connectionLost) {
                      main.socket.sendText(m.chat, `el bot @${name} perdio la conexion!! reiniciando...`, m, { mentions: [m.sender] })
                      await this.connect(config, m.sender.split('@')[0], false, pairingCode, m).catch((error) => console.log(error))
                  } else if (reason === DisconnectReason.connectionReplaced) {
                      main.socket.sendText(m.chat, `la conexion fue remplazada`, m, { mentions: [m.sender] })
                  } else {
                      main.socket.sendText(m.chat, `el bot @${name} se desconecto por un error inesperado!!. reiniciando...`, m, { mentions: [m.sender] })
                      await this.connect(config, m.sender.split('@')[0], false, pairingCode, m).catch((error) => console.log(error))
                  }
                }
                if (update.connection === 'open') {
                    main.socket.sendText(m.chat, `el bot @${name} se conecto con exito!!`, m, { mentions: [m.sender] })
                    if (!sessions.groupsMetadata) await sessions.socket.groupFetchAllParticipating().then((data)=>{ sessions.groupsMetadata = data})
                }
              }
      })
      if (!sessions.isMain) {
          const interval = setInterval(() => {// check if the socket is active in subbots if not close it
              if (sessions.socket === undefined || sessions.socket === null) return
              if (!sessions.socket?.user || !sessions.socket?.ws.socket === null) {
                  try {
                      sessions.socket?.ws?.close()
                  } catch (error) {
                      console.log(error)
                  }
                  sessions.socket.ev.removeAllListeners('creds.update')
                  sessions.socket.ev.removeAllListeners('messages.upsert')
                  sessions.socket.ev.removeAllListeners('connection.update')
                  sleep(1000)
                  sessions = null // release the socket
              }
                
            }, 60000)
      }
      

      sessions.socket.ev.on('creds.update', saveCreds)
    }
  }
    public decodeJid = (jid: string): string => {
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid)
            return ((decode.user && decode.server && decode.user + "@" + decode.server) || jid).trim()
        } else return jid.trim()
    }
    public sendText =  (jid: string, text: string, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
        return this.sendMessage(jid, { text: text, ...options }, { quoted: quoted })
    }
    public sendADMessage = (jid: string, text: string, newsLetterName: string, title: string, url: string, image: string , renderLargerThumbnail?: boolean, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
      return this.sendMessage(jid, { text: text, contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363303707275621@newsletter',
          newsletterName: newsLetterName,
          serverMessageId: -1,
          contentType: 1,
        },
        externalAdReply: {
          title: title,
          body: null,
          mediaType: 1,
          sourceUrl: url,
          renderLargerThumbnail: renderLargerThumbnail,
          thumbnailUrl: image,
          containsAutoReply: true,
          showAdAttribution: true
        }, ...options
      }}, { quoted: quoted })
    }
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
            }
          }
        }, { userJid: jid })
    
    return await this.relayMessage(jid, message.message, {messageId: message.key.id})
    }
    public downloadMediaMessage = async (m: MessageSerialize) => {
        const mime = m?.message[m.type]?.mimetype || ""
        const messageType = mime?.split("/")[0]
        const stream = await downloadContentFromMessage(m.message[m.type], messageType)
        return toBuffer(stream)
    }
    public downloadAndSaveMediaMessage = async (m: MessageSerialize, folder: string = "./temp", attachExtension:boolean = true): Promise<string> => {
        if (!fs.existsSync(folder)) fs.mkdirSync(folder)
          const mime = m?.message[m.type]?.mimetype || ""
          const messageType = mime?.split("/")[0]
          const stream = await downloadContentFromMessage(m.message[m.type], messageType)
          let buffer = await toBuffer(stream)
          const type = await fromBuffer(buffer);
          const pathfile = folder + `/${getRandom(10)}_${Date.now()}.${type.ext}`
          fs.writeFileSync(pathfile, buffer)
          buffer = null
          return pathfile
    }
    public sendImage = (jid: string, image: mediaUpload, caption?: string, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
        let media: WAMediaUpload
        if (typeof image === 'string' && isURL(image)) {
          media = { url: image }
        } else if (Buffer.isBuffer(image)) {
          media = image 
        } else {
          media = { stream: image as unknown as Readable }
        }
    return this.sendMessage(jid, { image: media, caption: caption, ...options }, { quoted: quoted ? quoted : null })
    }
      public sendVideo = (jid: string, video: mediaUpload, caption?: string, gifPlayback?: boolean, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>): Promise<proto.WebMessageInfo> => {
        let media: WAMediaUpload
        if (typeof video === 'string' && isURL(video)) {
          media = { url: video }
        } else if (Buffer.isBuffer(video)) {
          media = video
        } else {
          media = { stream: video as unknown as Readable }
        }
        return this.sendMessage(jid, { video: media, caption: caption, gifPlayback: gifPlayback ? gifPlayback : false, ...options }, { quoted: quoted ? quoted : null })
      }
      public sendAudio = (jid: string, audio: mediaUpload, ppt: boolean, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>) => {
        let media: WAMediaUpload
        if (typeof audio === 'string' && isURL(audio)) {
          media = { url: audio }
        } else if (Buffer.isBuffer(audio)) {
          media = audio
        } else {
          media = { stream: audio as unknown as Readable }
        }
        return this.sendMessage(jid, { audio: media, ptt: ppt ? ppt : false, ...options }, { quoted: quoted ? quoted : null })
      }
    public sendReaction = (jid: string, emoji: string, m: proto.IMessageKey): Promise<proto.WebMessageInfo | undefined> => {
        return this.sendMessage(jid, { react: { text: emoji, key: m } })
    }
    public async getMetadata(jid: string): Promise<GroupMetadata> {
      let instance = metadataCache.getInstance()
      let meta = instance!.getMeta(jid)
      if (!meta) {
        meta = await this!.groupMetadata(jid)
        instance!.saveMeta(jid, meta)
      }
      return meta!
    }
  public getProfilePicFromServer = async (jid: string) => {
    let data = cache.get(jid)
    if (!data) {
      console.log("Fetching profile picture from server")
      data = await this.profilePictureUrl(jid, 'image').catch(() => 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg')
      cache.set(jid, data)
    }
    return data!
  } 

  public user: conn['user']
  public ev: conn['ev']
  public ws: conn['ws']
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


