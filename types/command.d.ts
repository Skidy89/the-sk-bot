export declare type commands = {
    name: string
    aliases?: string[]
    category: string
    example?: string
    description: string
    usage?: string
    ownerOnly?: boolean
    groupOnly?: boolean
    adminOnly?: boolean
    nsfw?: boolean
    privateOnly?: boolean
    isBotAdmin?: boolean
    needPing?: boolean
    errored?: boolean
    cooldown?: number
    spam?: number
    handle: Function
}

export type downloads = {
    id: string
    cipher: string
    meta: {
        title: string
        source: string
        duration: number
        tags: string
    }
    thumb: string
    url: string[]
}