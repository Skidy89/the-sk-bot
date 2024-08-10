import {  makeInMemoryStore } from '@whiskeySockets/baileys'
import fs from "fs"
import { combatRoom } from "../../types"
import axios from "axios"
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { client, groupAdminsCache } from "../../core"
import BodyForm from "form-data"
import yts from "yt-search"
import pino, { Logger } from "pino"
import { Readable } from "stream";
import { GroupMetadata } from 'baileys';

/**
 * Generates a hash value for a given string.
 * @param content - The string for which to generate a hash.
 * @returns The generated hash as a string.
 */
export const generateHash = (content: string): string => {
    let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString()
}


async function search(query, options = {}) {
    let search = await yts.search({ query, hl: "es", gl: "ES", ...options });
    return search.videos
}
 


export const createRoom: { [id: string]: combatRoom } = {}


export const patchImage = async (conn: client, user: string, type: "welcome" | "goodbye") => {
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');
    
    try {
        const Ibackground = await loadImage('https://i.pinimg.com/564x/6a/1c/4f/6a1c4fc596d97bbcaeb032a4793b3f39.jpg');
        ctx.drawImage(Ibackground, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.error('Error loading background image:', error);
    }

    try {
        const pp = await conn?.getProfilePicFromServer(user)
        const avatar = await loadImage(pp);

        ctx.save();
        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 25, 25, 200, 200);
        ctx.restore();
    } catch (error) {
        console.error('Error loading avatar image:', error)
    }

    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    ctx.font = '60px sans-serif'
    ctx.fillStyle = '#ffffff'


    const text = type === 'welcome' ? 'bienvenido' : 'adios'
    const textWidth = ctx.measureText(text).width
    const x = (canvas.width - textWidth) / 2
    const y = canvas.height - 60


    ctx.fillText(text, x, y)


    return canvas.toBuffer('image/png')
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
export const getGroupAdmins = (groupID: string, participants: GroupMetadata['participants']): string[] => {
    const cache = groupAdminsCache.get(groupID);

    const currentAdmins = participants.filter(p => p.admin).map(p => p.id);

    if (cache) {
        if (!arraysEqual(cache, currentAdmins)) {
            console.log('Cache invalidated for', groupID);
            groupAdminsCache.set(groupID, currentAdmins);
        }
    } else {
        groupAdminsCache.set(groupID, currentAdmins)
    }

    return groupAdminsCache.get(groupID) || [];
}
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
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

export const getRandom = (ext: unknown) => {
    return (
        Math.random().toString(36).substring(2, 9).toUpperCase() + 
        Date.now().toString(36).toUpperCase() + 
        ext
    );
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export const host = [
    { hostname: "media.fslw1-1.fna.whatsapp.net", maxContentLengthBytes: NaN },
    { hostname: "media.fcgh28-1.fna.whatsapp.net", maxContentLengthBytes: NaN },
    { hostname: "mmg.whatsapp.net", maxContentLengthBytes: NaN },
  ]

export const patchDamage = (damage: number, defense: number): number => {
    const reduction = defense / (defense + 100)
    return damage * (1 - reduction)
}


export function msToTime(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
    const hoursStr = hours > 0 ? `${hours < 10 ? "0" + hours : hours} Horas ` : ""
    const minutesStr = minutes > 0 ? `${minutes < 10 ? "0" + minutes : minutes} Minutos ` : ""
    const secondsStr = `${seconds < 10 ? "0" + seconds : seconds} Seg`
  
    return `${hoursStr}${minutesStr}${secondsStr}`.trim()
  }
  
  const logger: Logger = pino({ level: 'debug', stream: 'store' })
  export const store = makeInMemoryStore({ logger })