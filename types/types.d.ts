import { Low } from "@commonify/lowdb"
import { chain } from "lodash"
import { proto, GroupMetadata, WASocket, WAMessage, MessageType, AnyMessageContent } from '@whiskeySockets/baileys'
import { Readable } from 'stream'
import { client } from "../core/client"

export type mediaUpload = string | Buffer | Readable
export type WAMediaUpload = Buffer | { url: URL | string } | { stream: Readable }
export declare type conn = Partial<WASocket>
export type DatabaseType = {
    users: { [key: string]: UserType }
    chats: { [key: string]: ChatType }
    settings: { [key: string]: SettingType }
    sticker: any
}
export interface low extends Low<DatabaseType> {
    READ?: boolean
    chain?: Partial<typeof chain>
}

declare type MessageSerialize = {
  eventMessage: proto.IEventResponse[]
  /**
   * is xyz@newsletter?
   * 
   */
  isNewsLetter: boolean
  /**
   * is status@broadcast?
   */
  isBroadcast: boolean | null | undefined
  /**
   * @returns 
   */
  messageTimestamp: number | Long
  /**
   * @returns status
   */
  status: number
  /**
   * @deprecated use key.id instead
   */
  id: string
  /**
   * @deprecated not use anymore for baileys
   */
  isBaileys: boolean
  /**
   * not use anymore for me
   * @deprecated use message[type] instead
   */
  msg: proto.IMessage[MessageSerialize['type']]
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
  quoted: MessageSerialize

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
  delete: () => Promise<void>
  /**
   * 
   * @param text 
   * @param jid 
   * @param quoted 
   * @param options 
   * @returns proto.WebMessageInfo
   */
  reply: (text: string, jid?: string, quoted?: proto.IWebMessageInfo, options?: Partial<AnyMessageContent>) => Promise<proto.WebMessageInfo>
}



export declare type commands = Partial<{
    name: string
    hide: boolean
    aliases: string[]
    category: string
    example: string
    description: string
    usage: string
    ownerOnly: boolean
    groupOnly: boolean
    adminOnly: boolean
    nsfw: boolean
    privateOnly: boolean
    isBotAdmin: boolean
    errored: boolean
    subbots: boolean
    handle: Function
}>

declare module "node-webpmux" {
    export class Image {
      constructor()
      exif: Buffer
      load(buffer: Buffer | string): Promise<void>
      save(...args: unknown[]): Promise<Buffer>
    }
}

type UserType = {
    name: string
    afkTime: number
    afkReason: string
    health: number
    exp: number
    role: string
    ability: number
    level: number
    especial: string
    meat: number
    gold: number
    iron: number
    bow: number
    sword: number
    pet: number
    petName: string
    petRarity: number
    petExp: number
    petLevel: number
    petHealth: number
    luck: number
    defense: number
    attack: number
    speed: number
    money: number
    limit: number
    lastDaily: number
    lastClaim: number
    lastStreak: number
    lastWork: number
    lastRob: number
    turnAbility: number
    potion: number
    pickaxe: number
    pickaxeDurability: number
    swordDurability: number
    swordName: string
    pickaxeName: string
    armorName: string
    sword: number
    armor: number
    armorDurability: number
    shield: number
    shieldDurability: number
    deaths: number
    lastAventure: number
  }
  
  type ChatType = {
    antilink: boolean
    ban: boolean
    modeadmin: boolean
    welcome: boolean
    audios: boolean
    antiNsfw: boolean
    antiSpam: boolean
    antiFake: boolean
    antiArabe: boolean
    detect: boolean
    welcomeMessage: string
  }
  
  type SettingType = {
    botName: string
    menuImage: string[]
    urlLinks: string
    legacyMenu: boolean
    customMenu: string
    antiCalls: boolean
    autoread: boolean
  }

  declare module globalThis {
    let db: low
    let commands: Map<string, commands>
  }

  declare type patchpassive = (user: UserType) => string

  type player = {
    id: string
  }

  type combatRoom = {
    player: player[]
    enemy: ICharacterStats
    result: 'wait' | 'started'
    turn: 'player' | 'enemy'
  }

  declare type event = {
    on: (obj: Ievent) => unknown
  }
  declare type Ievent = commands

export type ICharacterStats = {
    name: string
    image: string
    power: number
    stats: {
        health: number
        attack: number
        defense: number
    }
}

interface Rewards {
  reward: { [key: string]: number | number[] }
  lost: { [key: string]: number | number[] }
}

interface fetchInfo {
  url: string
}


type IdataVideoInfo = {
  videoTitle: string;
  thumbnail: string;
  duration: string;
  id: string;
}

type IdataDownload = Partial<{
  download: string;
  downloadMp3: string;
  fileSize: number;
  fileSizeMp3: number;
  id: string;
}>

type bot = {
  auth: string
  socket: client
  isMain: boolean
  groupsMetadata?: Record<string, GroupMetadata>
  interval?: NodeJS.Timeout
}

type cached = {
  key: proto.IMessageKey
  message: proto.IWebMessageInfo.Message | proto.IMessage | undefined
}
