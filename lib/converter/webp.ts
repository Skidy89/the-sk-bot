import fs from "fs"
import { ffmpeg } from "./ffmpeg"
import webp from 'node-webpmux'
import { join } from "path"
import { getRandom } from "../functions/functions"




export const toImage = async (buffer: string | Buffer) => {
  if (!fs.existsSync(join('./temp'))) {
    try {
      await fs.mkdirSync(join('./temp'))
    } catch (err) {
      console.error(`Failed to create temp directory: ${err}`)
      throw err
    }
  }
  const temp: any = join('./temp', getRandom(12) + '.webp')
  const temp2: any = join('./temp', getRandom(12) + '.jpg')

  fs.writeFileSync(temp2, buffer)

  await ffmpeg(temp, ['-i', temp, '-y', '-f', 'image2', temp2])

  return fs.readFileSync(temp2)
}
