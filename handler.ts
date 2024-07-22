import { worker } from "./core/worker"
import { client, serialize } from "./core"
import { getGroupAdmins } from "./lib/functions/functions"
import { MessageSerialize } from "./types"
import { config } from "./config"
import chalk from "chalk"
import CharacterBattle from "./lib/games/battle"
const msgs = (message) => { 
  if (message.length >= 10) { 
  return `${message.substr(0, 500)}` 
  } else { 
  return `${message}`}}
const activePins: Record<string, { pin: string, command: any, args: string[], wait: any,}> = {}


export async function handle(sock: client, m: MessageSerialize, Worker: worker) {
  try {
    if (!m || !m.body) return
    if (m.isBaileys) return
    var budy = (typeof m.text == 'string' ? m.text : '')
    const prefix = /^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)[0] : '!'
    const commandHandler = Worker.commands
    const isCmd = m.body.startsWith(prefix) ?  m.body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : false
    const commandName =  isCmd ? m.body.slice(1).trim().split(/ +/).shift().toLowerCase().split('\n')[0] : null
    const command = commandHandler?.get(commandName)
    const isOwner =  config.creator.includes(m.sender.split("@")[0])
    const groupMetadata = m.isGroup && (await sock.groupMetadata(m.chat))
    const participants = m.isGroup && (await groupMetadata.participants)
    const groupAdmins = m.isGroup && (await getGroupAdmins(participants))
    const isAdmin = m.isGroup ? groupAdmins.includes(m.sender) : false
    const isBotAdmin = m.isGroup ? groupAdmins.includes(sock.user.id) : false
    console.log(
      chalk.bold.white(`\n▣────────────···\n`),
      chalk.bold.white('\n│📑TIPO (SMS): ') + chalk.yellowBright(`${m.type}`),
      chalk.bold.white('\n│📊USUARIO: ') + chalk.cyanBright(m.pushname) + ' ➜ ', chalk.greenBright(m.sender),
      m.isGroup ? chalk.bold.white('\n│📤GRUPO: ') + chalk.greenBright(await groupMetadata.subject) + ' ➜ ' + chalk.greenBright(m.chat) : chalk.bold.greenBright('\n│📥PRIVADO'),
      chalk.bold.white('\n️│🏷️ TAGS: ') + chalk.bold.white(`[${activePins[m.sender] ? `✅ PIN: ${activePins[m.sender].pin}` : ''}]`),
      chalk.bold.white('\n│💬MENSAJE: ') + chalk.bold.white(`${msgs( await m.text ? m.text : m.body)}`) + chalk.whiteBright(`\n▣────────────···\n`)
    )
    var args: string[] = m.body.trim().split(/\s+/).slice(1)
    if (activePins[m.sender]) {
      const { pin, command, args } = activePins[m.sender]
      if (m.text.trim() === pin.trim()) {
        delete activePins[m.sender]
        await executeCommand(sock, m, Worker, command, { prefix, args })
        return
      }
    }
    if (isCmd) {
      if (!command) {
        const commandNames = Array.from(commandHandler.keys())
        let mostSimilarCommand = commandNames[0]
        let highestMatchCount = getMatch(commandName, mostSimilarCommand)

        for (const name of commandNames) {
            if (typeof name === 'string' && typeof commandName === 'string') {
                const matchCount = getMatch(commandName, name)
                if (matchCount > highestMatchCount) {
                    highestMatchCount = matchCount
                    mostSimilarCommand = name
                }
            }
        }

        const msg = `Comando no encontrado. Quizás quisiste decir: ${prefix}${mostSimilarCommand}`
        await sock.sendMessage(m.chat, { text: msg }, { quoted: m })
        return
    }
 
        
    switch(true) {
      case command.groupOnly && !m.isGroup:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar en grupos` }, { quoted: m })
            return

        case command.privateOnly && m.isGroup:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar en privado` }, { quoted: m })
            return

        case command.adminOnly && !isAdmin:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar por administradores` }, { quoted: m })
            return

        case command.needPing:
          const PIN = String(Math.floor(1000 + Math.random() * 9000)) 
          activePins[m.sender] = { pin: PIN, command, args, wait: setTimeout(() => {
            if (activePins[m.sender]) sock.sendText(m.chat, `no te pudiste verificar correctamente.`, m)
            delete activePins[m.sender]
            }, 60000) }
          return await sock.sendMessage(m.chat, { text: `Se te ha enviado un PIN de autorización único para este comando en tu consola.\nIntroduce tu PIN para continuar:` }, { quoted: m })

        case command.isBotAdmin && !isBotAdmin:
            await sock.sendMessage(m.chat, { text: `Este comando solo se puede usar si el bot es admin` }, { quoted: m })
            return

        default:
            try {
              if(commandName === 'test') {
                const battle = new CharacterBattle(m.sender, m.chat, sock, m)
                await battle.startBattle()

              } else {
                await command.handle(sock, m, Worker, { prefix, args: m.body.slice(1).trim().split(/ +/).slice(1) })}
            } catch (error) {
                await sock.sendMessage(m.chat, { text: `El comando ${commandName} contiene un error\n${error}` })
            }
    }
    if (budy.startsWith('>')) {
      if (!isOwner) return
      try {
          return m.reply(JSON.stringify(eval(budy.slice(2)), null, '\t'))
      } catch (e) {
          e = String(e)
          m.reply(e)
      }
  }
  if (budy.startsWith('=>')) {
      if (!isOwner) return
      try {
          return  m.reply(JSON.stringify(eval(`(async () => { ${budy.slice(3)} })()`), null, '\t'))  //gata.sendMessage(from, JSON.stringify(eval(`(async () => { ${budy.slice(3)} })()`), null, '\t'), text, { quoted: msg })
      } catch (e) {
          e = String(e)
          m.reply(e)
      }
  }
    }
    
  
  } catch (e) {
    throw e
  }
  



}


async function executeCommand(sock: client, m: MessageSerialize, Worker: worker, command: any, { prefix, args }: { prefix: string, args: string[] }) {
  try {
    await command.handle(sock, m, Worker, { prefix, args })
  } catch (error) {
    await sock.sendMessage(m.chat, { text: `El comando contiene un error: ${error.message}` })
  }
}

        function getMatch(str1: string, str2: string) {
           if (typeof str1 !== 'string' || typeof str2 !== 'string') {
              throw new TypeError('Both arguments must be strings')
           }
          
            let matchCount = 0
          
            for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
              if (str1[i] === str2[i]) {
                matchCount++
              }
            }
          
            return matchCount
          }
          