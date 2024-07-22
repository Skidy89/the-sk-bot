import { proto, GroupMetadata, WASocket, WAMessage } from '@whiskeysockets/baileys'
import { Readable } from 'stream'

export type mediaUpload = string | Buffer | Readable
export type WAMediaUpload = Buffer | { url: URL | string } | { stream: Readable }

declare type MessageSerialize = {
  /**
   * @deprecated use key.id instead
   */
  id: string
  /**
   * @deprecated not use anymore for baileys
   */
  isBaileys: boolean
  /**
   * idk what but works
   * @param any
   */
  msg: any
  /** WebMessageInfo key */
  key: proto.IMessageKey
  /** the jid of chat
   * should return xyz@s.whatsapp.net or @g.us
   */
  chat: string
  /**
   * @deprecated use key.fromMe instead
   */
  fromMe: boolean
  /* author message */
  sender: string 
  /**
   * author pushName
   */
  pushname: string
  /**
   * proto.IMessage type
   */
  type: string
  /** propiertes of a message */
  message: proto.IMessage
  /**mentioned jids */
  mentionedJid: string[]
  /** body of the message */
  body: string
  /** should send ["hi", "im", "skid"]*/
  args: string[]
  /**should send "hi im skid" */
  arg: string
  /**
   * @deprecated use arg or args.join(" ") instead
   */
  query: string
  /**
   * @boolean is this is a group
   */
  isGroup: boolean
  /**
   * metadata of a group
   */
  groupMetadata: GroupMetadata
  /**
   * 
   * @returns buffer
   */
  download: () => Promise<Buffer>
  quoted: {

    type: string
    /** WebMessageInfo key */
    key: proto.IMessageKey
    /** propiertes of a message */
    message: proto.IMessage
    /**
    * @deprecated use key.id instead
    */
    id: string
    /**
     * @deprecated not use anymore from baileys
     */
    isBaileys: boolean
    /* author message */
    sender: string
    /**
     * @deprecated why this exist
     */
    caption: string
    /**
    * @deprecated use key.fromMe instead
    */
    fromMe: boolean
    /**text of a message */
    text: string
    /**
     * mentioned jids in a quoted
     */
    mentionedJid?: string[]
    /**
     * shold return a proto promise
     */
    fakeObj?: any
    /**
     * 
     * @returns void
     */
    delete: () => Promise<void>
    /**
     * 
     * @returns buffer
     */
    download: () => Promise<Buffer>
  }
  /**text of a message */
  text: string
  /**
   * 
   * @param jid 
   * @param forceForward 
   * @param options 
   * @returns proto.WebMessageInfo
   */
  copyNForward: (jid: string, forceForward: boolean, options) => Promise<proto.WebMessageInfo>
  /**
   * 
   * @returns proto.WebMessageInfo
   */
  delete: () => Promise<proto.WebMessageInfo>
  /**
   * 
   * @param text 
   * @param jid 
   * @param quoted 
   * @param options 
   * @returns proto.WebMessageInfo
   */
  reply: (text: string, jid?: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>) => Promise<proto.WebMessageInfo>
}




  declare type conn = Partial<WASocket>