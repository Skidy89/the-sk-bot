import { commands, MessageSerialize } from "../types/"
import { join } from "path"
import chalk from "chalk"
import fs from "fs-extra"
import { resolve } from "path"
import { client } from "./client"





interface subbots {
    isInit: boolean | false
    uptime: Number
    botname: string | undefined
    sockets: client
}

export class worker  {
    ws: client
    commands: Map<string, commands> = new Map()
    socket: Map<string, subbots> = new Map()
    m: MessageSerialize
    loadCommands() {
        console.log(chalk.yellowBright.bold("[INFO] Installing Plugins... Please wait."))
        const commandsPath = resolve(__dirname, '..', 'commmands')
        let moduleFiles: string[] = fs.readdirSync(join(__dirname, '../commands')).filter((file) => file.endsWith('.ts'))
        if (moduleFiles.length === 0) {
            console.log(chalk.redBright.bold("[ERROR] No modules found to install."))
        } else {
            console.log(chalk.yellowBright.bold("[INFO] Found"), chalk.cyanBright.bold(`${moduleFiles.length}`), chalk.yellowBright.bold("modules to install."))
        }
        for (let file of moduleFiles) {
            try {
                const command = require(join(__dirname, '../commands', `${file}`))
                this.commands.set(command.name, command)
            } catch (error) {
                console.log(
                    chalk.blueBright.bold("[INFO] Could not import module"),
                    chalk.redBright.bold(`${file}`)
                )
                console.log(error)
                continue
            }}
            console.log(chalk.green.bold("[INFO] Plugins Installed Successfully"))        
    }

}

