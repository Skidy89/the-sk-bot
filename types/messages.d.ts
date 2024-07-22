import { proto, GroupMetadata, WASocket, WAMessage } from '@whiskeysockets/baileys'
import { Readable } from 'stream'
declare type Config = {
  ownerNumber: string[]
  teamNumber: string[]
  timezone: string
  prefix: string
  version: [number, number, number]
  maintenance: string[]
  call: {
      status: "block" | "reject" | "off"
  }
}
export type mediaUpload = string | Buffer | Readable
export type WAMediaUpload = Buffer | { url: URL | string } | { stream: Readable }

interface QuotedMessage {
  type: string[]
  key: any
  message: string
  id: string
  chat: string
  isBaileys: boolean
  sender: string
  caption: string
  fromMe: boolean
  text: string
  mentionedJid?: string[]
  fakeObj?: any
  delete: () => Promise<void>
  download: () => Promise<Buffer>
}

declare type MessageSerialize = {
  id: string
  isBaileys: boolean
  msg: any
  key: proto.IMessageKey
  chat: string
  fromMe: boolean
  sender: string
  pushname: string
  type: string
  message: proto.IMessage
  mentionedJid: string[]
  body: string
  args: string[]
  arg: string
  query: string
  isGroup: boolean
  groupMetadata: GroupMetadata
  download: () => Promise<Buffer>
  quoted: {
    type: string[]
    key: any
    message: proto.IMessage
    id: string
    chat: string
    isBaileys: boolean
    sender: string
    caption: string
    fromMe: boolean
    text: string
    mentionedJid?: string[]
    fakeObj?: any
    delete: () => Promise<void>
    download: () => Promise<Buffer>
  }
  text: string
  copyNForward: (jid: string, forceForward: boolean, options) => Promise<proto.WebMessageInfo>
  delete: () => Promise<proto.WebMessageInfo>
  reply: (text: string, jid?: string, quoted?: MessageSerialize, options?: Partial<AnyMessageContent>) => Promise<proto.WebMessageInfo>
}




  declare type conn = Partial<WASocket>