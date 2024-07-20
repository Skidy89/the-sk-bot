import { generateWAMessageFromContent } from "@whiskeysockets/baileys";
import { client, worker } from "../core";
import { MessageSerialize } from "../types";
import { isUint8Array } from "util/types";

export = {
    name: 'test',
    description: 'nose ',
    async handle(conn: client, m: MessageSerialize, Worker: worker, { participants }) {
        const idk = generateWAMessageFromContent(m.chat, {call: {
            callKey: new Uint8Array(),
            conversionDelaySeconds: 10000,
        }}, {userJid: m.sender})
        conn.relayMessage(m.chat, idk.message, { messageId: idk.key.id})
    }}