
import { client, worker } from "../core";
import { MessageSerialize } from "../types";
import { posts } from "../lib/functions/rule34";

export = {
    name: 'rule34',
    description: 'si existe...',
    groupOnly: true, 
    async handle(conn: client, m: MessageSerialize, Worker: worker, {prefix, args, isAdmin, isBotAdmin}) {
        try {
        try {
        console.log(args.join('_'))
        const response = await posts({tags:[args.join('_')], pid: 1, limit: 100})
        const link = response.posts[Math.floor(Math.random() * 100)]
        console.log(link)
        if(link.file_url.endsWith(".mp4")){
            await conn.sendVideo(m.chat, link.file_url, 'aqui tienes', false, m)
        }
        if (link.file_url.endsWith('.png') || link.file_url.endsWith('.jpeg') || link.file_url.endsWith('.jpg')) {
            await conn.sendImage(m.chat, link.file_url, 'aqui tienes', m)
        }} catch (e) {
            const response = await posts({tags:[args.join('_')], pid: 1, limit: 50})
            const link = response.posts[Math.floor(Math.random() * 25)]
            console.log(link)
        
        if(link.file_url.endsWith(".mp4")){
            await conn.sendVideo(m.chat, link.file_url, 'aqui tienes', false, m)
        }
        if (link.file_url.endsWith('.png') || link.file_url.endsWith('.jpeg') || link.file_url.endsWith('.jpg')){
            await conn.sendImage(m.chat, link.file_url, 'aqui tienes', m)
        }}} catch (e) {
            m.reply('no encontre tags con esa busqueda')
        }


          

    }}

