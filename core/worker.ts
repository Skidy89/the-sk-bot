import { bot, cached, commands } from "../types/";
import { join } from "path";
import chalk from "chalk";
import fs from "fs-extra";
import { GroupMetadata, proto } from '@whiskeySockets/baileys';

class MetaCache {
  private metadataCache = new Map<string, GroupMetadata>()

  saveMeta(jid: string, meta: GroupMetadata) {
    this.metadataCache.set(jid, meta)
  }

  getMeta(jid: string): GroupMetadata | undefined {
    return this.metadataCache.get(jid)
  }
}

export class metadataCache {
  private static instance: MetaCache | null = null

  static getInstance(): MetaCache {
    if (!this.instance) {
      this.instance = new MetaCache()
    }
    return this.instance
  }
}
//maps
export const cache = new Map<string, string>()
export const dataSessions = new Map<string, bot>()
export const Icommand = new Map<string, commands>()
export const groupAdminsCache = new Map<string, string[]>()

export async function loadCommands() {
  console.log(chalk.yellowBright.bold("[INFO] Installing Plugins... Please wait."))
  
  const moduleFiles = fs.readdirSync(join(__dirname, '../commands')).filter(file => file.endsWith('.ts'))
  
  if (moduleFiles.length === 0) {
    console.log(chalk.redBright.bold("[ERROR] No modules found to install."))
    return
  }
  
  console.log(chalk.yellowBright.bold("[INFO] Found"), chalk.cyanBright.bold(`${moduleFiles.length}`), chalk.yellowBright.bold("modules to install."))
  
  for (const file of moduleFiles) {
    try {
        const command = await import(join(join(__dirname, '../commands'), file));
        Icommand.set(command.name, command)
        if (!command.name) console.log(chalk.redBright.bold(`[ERROR] The command in ${file} has no name. Skipping...`)); continue    
    } catch (error) {
        console.log(chalk.blueBright.bold("[INFO] Could not import module"), chalk.redBright.bold(file));
        console.error(error);
        continue
    }
}
  console.log(chalk.green.bold("[INFO] Plugins Installed Successfully"));
}
