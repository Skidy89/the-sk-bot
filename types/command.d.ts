

export declare type commands = {
    name: string
    description: string
    usage?: string
    ownerOnly?: boolean
    groupOnly?: boolean
    adminOnly?: boolean
    nsfw?: boolean
    privateOnly?: boolean
    isBotAdmin?: boolean
    needPing?: boolean
    
    handle: Function
}