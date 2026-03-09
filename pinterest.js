/*
Name Fitur : pinterest [ search ]
Type Code : esm
Created By : masrey
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import mess from "../../strings/index.js";
import { getBuffer } from "../../lib/utils.js";
import { logCustom } from "../../lib/logger.js";

async function sendMessageWithQuote(sock, remoteJid, message, text) {
  await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

function pickRandom(arr = []) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function handle(sock, messageInfo) {
  const { remoteJid, message, content, prefix, command } = messageInfo;

  try {
    const query = content.trim();

    if (!query) {
      return sendMessageWithQuote(
        sock,
        remoteJid,
        message,
        `_⚠️ Format Penggunaan:_\n\n_💬 Contoh:_ *${prefix + command} kucing*`
      );
    }

    // react loading
    await sock.sendMessage(remoteJid, {
      react: { text: "⏰", key: message.key },
    });

    const apiUrl =
      "https://api.nexray.web.id/search/pinterest?q=" +
      encodeURIComponent(query);

    const { data } = await axios.get(apiUrl);

    if (!data?.result?.length) {
      return sendMessageWithQuote(
        sock,
        remoteJid,
        message,
        "❌ _Gambar tidak ditemukan_"
      );
    }

    const result = pickRandom(data.result);
    const imageUrl = result;

    const buffer = await getBuffer(imageUrl);

    await sock.sendMessage(
      remoteJid,
      {
        image: buffer,
        caption: `✅ ʜᴀsɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ : *${query}*`,
      },
      { quoted: message }
    );
  } catch (error) {
    logCustom("info", content, `ERROR-COMMAND-${command}.txt`);

    await sendMessageWithQuote(
      sock,
      remoteJid,
      message,
      `⚠️ Terjadi kesalahan.\n\nDetail Error:\n${error.message || error}`
    );
  }
}

export default {
  handle,
  Commands: ["pin", "pinterest"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};