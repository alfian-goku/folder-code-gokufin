/*
Name Fitur : Spotify Search [ Via Query ]
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

/* =========================
   ESM VERSION
========================= */

import axios from "axios";

async function handle(sock, messageInfo) {

  const { m, remoteJid, prefix, command, content } = messageInfo;

  try {
    const query = content?.trim();

    if (!query) {
      return await sock.sendMessage(remoteJid,{
        text:
`⚠️ *Format Penggunaan :*

💬 *Contoh :*
${prefix + command} 8 letters`
      },{ quoted:m });
    }

    // Reaction proses
    await sock.sendMessage(remoteJid,{
      react:{ text:"🔎", key:m.key }
    });

    const apiUrl =
`https://api.nexray.web.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.status) {
      throw new Error("Data lagu tidak ditemukan");
    }

    const results = Array.isArray(data.result)
      ? data.result
      : [data.result];

    let text =
`🔎 *Hasil Pencarian Spotify*

🔍 Query : ${query}

━━━━━━━━━━━━━━━
`;

    results.slice(0,1).forEach((item, index) => {

      text +=
`
🎵 *Spotify Play*

📀 Judul : ${item.title}
🎤 Artist : ${item.artist}
💽 Album : ${item.album}
📅 Release : ${item.release_at}
🕖 Duration : ${item.duration}
⭐ Popularity : ${item.popularity}
🔗 Url Lagu : ${item.url}`;
    });

      /// kirim text
    await sock.sendMessage(remoteJid,{
      text: text.trim()
    },{ quoted:m });

    // Reaction sukses
    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:m.key }
    });

  } catch (err) {
    console.error(
      "Spotify Search Error:",
      err?.response?.data||err.message
    );

    await sock.sendMessage(remoteJid,{
      text:
`⚠️ Maaf , terjadi kesalahan saat mencari lagu Spotify.

💡 Detail Error :
${err?.message}`
    },{ quoted:m });

    // Kirim reaction eror
    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:m.key }
    });
  }
}

export default {
  handle,
  Commands: ["playspotify", "sspot", "ssptfy", "playspot"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};


/* =========================
   CJS VERSION
========================= */

const axios = require("axios");

async function handle(sock, messageInfo) {

  const { m, remoteJid, prefix, command, content } = messageInfo;

  try {
    const query = content?.trim();

    if (!query) {
      return await sock.sendMessage(remoteJid,{
        text:
`⚠️ *Format Penggunaan :*

💬 *Contoh :*
${prefix + command} 8 letters`
      },{ quoted:m });
    }

    await sock.sendMessage(remoteJid,{
      react:{ text:"🔎", key:m.key }
    });

    const apiUrl =
`https://api.nexray.web.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.status) {
      throw new Error("Data lagu tidak ditemukan");
    }

    const results = Array.isArray(data.result)
      ? data.result
      : [data.result];

    let text =
`🔎 *Hasil Pencarian Spotify*

🔍 Query : ${query}

━━━━━━━━━━━━━━━
`;

    results.slice(0,1).forEach((item, index) => {

      text +=
`
🎵 *Spotify Play*

📀 Judul : ${item.title}
🎤 Artist : ${item.artist}
💽 Album : ${item.album}
📅 Release : ${item.release_at}
🕖 Duration : ${item.duration}
⭐ Popularity : ${item.popularity}
🔗 Url Lagu : ${item.url}`;
    });

    await sock.sendMessage(remoteJid,{
      text: text.trim()
    },{ quoted:m });

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:m.key }
    });

  } catch (err) {
    console.error(
      "Spotify Search Error:",
      err?.response?.data||err.message
    );

    await sock.sendMessage(remoteJid,{
      text:
`⚠️ Maaf , terjadi kesalahan saat mencari lagu Spotify.

💡 Detail Error :
${err?.message}`
    },{ quoted:m });

    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:m.key }
    });
  }
}

module.exports = {
  handle,
  Commands: ["playspotify", "sspot", "ssptfy", "playspot"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};


/* =========================
   CASE VERSION
========================= */

case "playspotify":
case "sspot":
case "ssptfy":
case "playspot": {

const axios = require("axios");

try {
  const query = text?.trim();

  if (!query) {
    return m.reply(
`⚠️ *Format Penggunaan :*

💬 *Contoh :*
${prefix + command} 8 letters`
    );
  }

  await sock.sendMessage(m.chat,{
    react:{ text:"🔎", key:m.key }
  });

  const apiUrl =
`https://api.nexray.web.id/downloader/spotifyplay?q=${encodeURIComponent(query)}`;

  const { data } = await axios.get(apiUrl);

  if (!data?.status) {
    throw new Error("Data lagu tidak ditemukan");
  }

  const results = Array.isArray(data.result)
    ? data.result
    : [data.result];

  let textResult =
`🔎 *Hasil Pencarian Spotify*

🔍 Query : ${query}

━━━━━━━━━━━━━━━
`;

  results.slice(0,1).forEach((item, index) => {

    textResult +=
`
🎵 *Spotify Play*

📀 Judul : ${item.title}
🎤 Artist : ${item.artist}
💽 Album : ${item.album}
📅 Release : ${item.release_at}
🕖 Duration : ${item.duration}
⭐ Popularity : ${item.popularity}
🔗 Url Lagu : ${item.url}`;
  });

  await sock.sendMessage(m.chat,{
    text: textResult.trim()
  },{ quoted:m });

  await sock.sendMessage(m.chat,{
    react:{ text:"✅", key:m.key }
  });

} catch (err) {
  console.error(
    "Spotify Search Error:",
    err?.response?.data||err.message
  );

  await sock.sendMessage(m.chat,{
    text:
`⚠️ Maaf , terjadi kesalahan saat mencari lagu Spotify.

💡 Detail Error :
${err?.message}`
  },{ quoted:m });

  await sock.sendMessage(m.chat,{
    react:{ text:"❌", key:m.key }
  });
}

}
break;