import {  makeInMemoryStore,  proto } from "@whiskeysockets/baileys"
import { randomBytes } from "crypto"
import fs from "fs"
import pino, { Logger } from "pino"
import { combatRoom, MessageSerialize, Rewards, UserType } from "../../types"
import axios from "axios"
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { client } from "../../core"
import BodyForm from "form-data"
import { fetchInfo, IdataDownload, IdataVideoInfo } from "../../types/types"
import { load } from "cheerio"

/**
 * Generates a hash value for a given string.
 * @param content - The string for which to generate a hash.
 * @returns The generated hash as a string.
 */
export const generateHash = (content: string): string => {
    let hash: number = 0
    for (let i: number = 0; i < content.length; i++) {
        const char: number = content.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0
    }
    return hash.toString()
}



  
  async function patchVideoInfo(IvideoInfo: fetchInfo): Promise<IdataVideoInfo> {
      const { url } = IvideoInfo
      const Iurl = 'https://vidsavefrom.com/mates/en/analyze/ajax?retry=undefined&platform=youtube'
      const response = await axios.post(Iurl, new URLSearchParams({
          url,
          platform: 'youtube'
        }).toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      const $ = load(response.data.result)
      const videoTitle = $('#video_title').text().trim()
      const thumbnail = $('img.img-thumbnail').attr('src') || ''
      const duration = $('p.m-b-0.m-t').text().replace('Duration: ', '')
      const id = $('#video_status').attr('data-id') || ''
      return { videoTitle, thumbnail, duration, id }
  
      
  }
  
    
  
  export async function youtubeDownloader(params: fetchInfo): Promise<IdataDownload> {
      const IvideoData = await patchVideoInfo(params)
      const data = new URLSearchParams({
          id: IvideoData.id,
          platform: 'youtube',
          url: params.url,
          title: IvideoData.videoTitle,
          ext: 'mp4',
          note: '720p60',
          format: '136'
        })
        const response = await axios.post('https://vidsavefrom.com/mates/en/convert?id=' + IvideoData.id, data.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'es-419,es;q=0.8',
            'Origin': 'https://vidsavefrom.com',
            'Referer': 'https://vidsavefrom.com/es/',
            'Sec-CH-UA': '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-GPC': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            'X-Note': '720p60',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        const Idata = new URLSearchParams({
            id: IvideoData.id,
            platform: 'youtube',
            url: params.url,
            title: IvideoData.videoTitle,
            ext: 'mp3',
            note: '128kbps',
            format: ''
          })
          const responseMp3 = await axios.post('https://vidsavefrom.com/mates/en/convert?id=OtOYL4Ck9fI', Idata.toString(), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'Accept': 'application/json, text/javascript, */*; q=0.01',
              'Accept-Encoding': 'gzip, deflate, br, zstd',
              'Accept-Language': 'es-419,es;q=0.8',
              'Origin': 'https://vidsavefrom.com',
              'Referer': 'https://vidsavefrom.com/es/',
              'Sec-CH-UA': '"Not)A;Brand";v="99", "Brave";v="127", "Chromium";v="127"',
              'Sec-CH-UA-Mobile': '?0',
              'Sec-CH-UA-Platform': '"Windows"',
              'Sec-Fetch-Dest': 'empty',
              'Sec-Fetch-Mode': 'cors',
              'Sec-Fetch-Site': 'same-origin',
              'Sec-GPC': '1',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
              'X-Note': '720p60',
              'X-Requested-With': 'XMLHttpRequest'
            }
          })
        const downloadMp3 = (responseMp3.data.downloadUrlX)
        
        const download = (response.data.downloadUrlX)
        console.log(response.data)
        return {videoTitle: IvideoData.videoTitle, thumbnail: IvideoData.thumbnail, duration: IvideoData.duration, download: download, downloadMp3: downloadMp3, id: IvideoData.id}
  }


export const createRoom: { [id: string]: combatRoom } = {}


export const patchImage = async (conn: client, m: proto.IWebMessageInfo, type: "welcome" | "goodbye") => {
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    

    const Ibackground = await loadImage('https://i.pinimg.com/564x/6a/1c/4f/6a1c4fc596d97bbcaeb032a4793b3f39.jpg').catch(error => {
        console.error('Error loading background image:', error);
    });

    if (Ibackground) {
        ctx.drawImage(Ibackground, 0, 0, canvas.width, canvas.height);
    } else {
        console.error('Background image not loaded.');
    }

    let pp;


    pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(error => {
        console.error('Error getting profile picture URL:', error);
        return 'https://i.ibb.co/Rbb2yXn/sinfoto.jpg';
    });


    const avatar = await loadImage(pp).catch(error => {
        console.error('Error loading avatar image:', error);
    });

    if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 200, 200);
        ctx.restore();
    } else {
        console.error('Avatar image not loaded.');
    }


    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.font = '60px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(type === 'welcome' ? 'bienvenido' : 'adios', canvas.width / 2.5, canvas.height / 1.8);

    return canvas.toBuffer('image/png');
}

/**
 * Uploads a file to Telegra.ph and returns the URL of the uploaded file.
 * @param Path - The path to the file to be uploaded. Must be a string.
 * @throws {Error} - If the file does not exist at the specified path.
 * @returns {Promise<string>} - The URL of the uploaded file as a Promise<string>.
 */
export const telegraPh = async (Path: string): Promise<string> => {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new BodyForm();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}


export const getBuffer = async (url: string, options?: { headers?: Record<string, string> }): Promise<ArrayBuffer> => {
    const res = await axios.get<ArrayBuffer>(url, {
        ...options,
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    })
    return res.data
}





/**
 * Retrieves the list of group admins from an array of group participants.
 * @param participants - An array of group participants, each with an 'id' and 'admin' property.
 * @returns An array of strings representing the IDs of the group admins.
 */
export const getGroupAdmins = (participants) => {
	const admins = []
	for (let i of participants) {
		i.admin ? admins.push(i.id) : ''
	}
	return admins
}


/**
 * @param str - The string to be checked.
 * @returns True if the string is valid JSON, false otherwise.
 */
export const isJSON = (str: string): boolean => {
    try {
        JSON.parse(str)
    } catch (e) {
        if (e instanceof SyntaxError) {
            return false
        }
        throw e
    }
    return true
}


/**
 * Checks if a string is a valid URL.
 * @param str - The string to be checked.
 * @returns True if the string is a valid URL, false otherwise.
 */
export const isURL = (str: string): str is string => {
    let url: URL | undefined
    try {
        url = new URL(str)
    } catch {
        return false
    }
    return url !== undefined && (url.protocol === "http:" || url.protocol === "https:")}


export const generateRandomNumber = (length) => {
    if (length <= 0) {
        return ""
    }

    let result = ""
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10)
    }

    return result
}

export const fileformat = (url: string) => {
    const array = url.split("/")
    return array[array.length - 1].split(".")[1]
}

export const runtime = (seconds: number) => {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor((seconds % (3600 * 24)) / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? " dia, " : " dias, ") : ""
    var hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
}

export const removeDuplicateArray = (array = []) => {
    const arr = new Set(array)
    const uniqueArray = []
    for (const value of arr) {
        if (uniqueArray.indexOf(value) === -1) {
            uniqueArray.push(value)
        }
    }
    return uniqueArray
}

export const toMB = (size: number) => {
    return size / 1024 ** 2
}

const padTo2Digits = (num: number) => {
    return num.toString().padStart(2, "0")
}

export const getFilesize = (filename: string) => {
    const stats = fs.statSync(filename)
    let bytes = stats.size
    let size: string
    if (bytes >= 1073741824) {
        size = (bytes / 1073741824).toFixed(2) + " GB"
    } else if (bytes >= 1048576) {
        size = (bytes / 1048576).toFixed(2) + " MB"
    } else if (bytes >= 1024) {
        size = (bytes / 1024).toFixed(2) + " KB"
    } else if (bytes > 1) {
        size = bytes + " bytes"
    } else if (bytes == 1) {
        size = bytes + " byte"
    } else {
        size = "0 bytes"
    }
    return size
}



export const convertSecToDuration = (seconds: number) => {
    let minutes = Math.floor(seconds / 60)

    seconds = seconds % 60

    return `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export const convertSecToTime = (seconds: number) => {
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)

    seconds = seconds % 60

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export const getRemaining = (time: number) => {
    const total = Date.now() - time
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))

    return (
        (days ? (days > 1 ? days + " days " : days == 1 ? " day " : "") : "") +
        (hours ? (hours > 1 ? hours + " hours " : hours == 1 ? " hour " : "") : "") +
        (minutes ? (minutes > 1 ? minutes + " minutes " : minutes == 1 ? " minute " : "") : "") +
        (seconds ? (seconds > 1 ? seconds + " seconds " : seconds == 1 ? " second " : "") : "")
    )
}

export const getRandom = (ext: any) => {
    return randomBytes(7).toString("hex").toUpperCase() + ext
}

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}
export function getMediaType(message: MessageSerialize) {
    if (message.type.includes("imageMessage") || (message.quoted && message.quoted?.type?.includes("imageMessage"))) {
      return "image"
    } else if (message.type.includes("videoMessage") || (message.quoted && message.quoted?.type?.includes("videoMessage"))) {
      return "video"
    } else if (message.type.includes("stickerMessage") || (message.quoted && message.quoted.type.includes("stickerMessage"))) {
      return "sticker"
    }
  }
const logger: Logger = pino({ level: 'debug', stream: 'store' })

export const host = [{
    hostname: 'media.fslw1-1.fna.whatsapp.net',
    maxContentLengthBytes: NaN
},
{
    hostname: 'media.fcgh28-1.fna.whatsapp.net',
    maxContentLengthBytes: NaN
},
{
    hostname: 'media.fcgh20-1.fna.whatsapp.net',
    maxContentLengthBytes: NaN
},
{
    hostname: 'mmg.whatsapp.net',
    maxContentLengthBytes: NaN
},]

export const patchDamage = (damage: number, defense: number): number => {
    const reduction = defense / (defense + 100)
    return damage * (1 - reduction)
}


export function msToTime(duration: number): string {
    const milliseconds = Math.floor((duration % 1000) / 100)
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
    const hoursStr = hours > 0 ? `${hours < 10 ? "0" + hours : hours} Horas ` : ""
    const minutesStr = minutes > 0 ? `${minutes < 10 ? "0" + minutes : minutes} Minutos ` : ""
    const secondsStr = `${seconds < 10 ? "0" + seconds : seconds} Seg`
  
    return `${hoursStr}${minutesStr}${secondsStr}`.trim()
  }
  
  
  

    
export const store = makeInMemoryStore({ logger })

