import { client } from "../core/client"
import { worker } from "../core/worker"
import { MessageSerialize } from "../types/messages"
import { toZonedTime } from 'date-fns-tz'
import { pickRandom } from "../lib/functions/functions"

export = {
    name: 'menu',
    description: 'menu de comandos',
    async handle(conn: client, m: MessageSerialize, Worker: worker, { prefix }) {

        var command = Worker.commands
        const facts = ["todo esta sujeto a cambios ❤", 'Typescript Edition', 'JUST A BETA!!', 'el hambre me gana', 'recode!!']
        let str = `╭────《 ` + '*ts sk*' + ` 》─────⊷\n`
        str += `│ ╭──────────────◆
│ │ usuario: ${await conn.getName(m.sender)}
│ │ creador: Skid
│ │ Comandos: ${Worker.commands.size}
│ ╰──────────────◆
╰───────────────⊷\n
`
        str += `╭────❏ *BETA* ❏\n` 
        command.forEach((cmd) => {
            str += `\n│ ${prefix}${cmd.name} - ${cmd.description}`   
        })
        str += `\n╰━━━━━━━━━━━━━──⊷\n` 
        
        str += `\n\n${getTime('America/Mexico_City')}\n${pickRandom(facts)}`  
        
        await conn.sendText(m.chat, str)
    }
}





function getTime(timeZone: string): string {
    const now = new Date()
    const zonedTime = toZonedTime(now, timeZone)
    const hora = zonedTime.getHours()

    if (hora >= 0 && hora < 12) {
        return "Buenos días ☀"
    } else if (hora >= 12 && hora < 18) {
        return "Buenas tardes 🏝"
    } else {
        return "Buenas noches 🌙"
    }
}
