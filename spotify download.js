/*
Name Fitur : Spotify Download [ Via Url ]
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {

  const {
    m,
    remoteJid,
    prefix,
    command,
    content
  } = messageInfo;

  const url = content?.trim();

  if (!url) {
    return await sock.sendMessage(remoteJid,{
      text:
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* url_spotify

💬 *Contoh :*
${prefix + command} https://open.spotify.com/track/abcdefg12345`
    },{ quoted:m });
  }

  try {

    await sock.sendMessage(remoteJid,{
      react:{ text:"🎵", key:m.key }
    });

    const apiUrl =
`https://api.nexray.web.id/downloader/v1/spotify?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.status) {
      throw new Error("Gagal mengambil data lagu");
    }

    const result = data.result;

    const title = result.title;
    const artist = result.artist?.join(", ");
    const album = result.album;
    const release = result.release_at;
    const thumbnail = result.thumbnail;
    const audioUrl = result.url;

    const durationSec = Math.floor(result.duration / 1000);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;

    const duration =
`${minutes}:${seconds.toString().padStart(2,"0")}`;

    let sizeText;

    if (result.size >= 1024 * 1024) {
      sizeText =
(result.size / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      sizeText =
(result.size / 1024).toFixed(2) + " KB";
    }

    const infoMsg = await sock.sendMessage(remoteJid,{
      image:{ url:thumbnail },
      caption:
`🎵 *Spotify Downloader*

📀 Title : ${title}
🎤 Artist : ${artist}
💽 Album : ${album}
📅 Release : ${release}
⏱ Duration : ${duration}
📦 Size : ${sizeText}`
    },{ quoted:m });

    await sock.sendMessage(remoteJid,{
      audio:{ url:audioUrl },
      mimetype:"audio/mpeg",
      fileName:`${title}.mp3`
    },{
      quoted:infoMsg
    });

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:m.key }
    });

  } catch (err) {
    console.error(
      "Spotify Downloader Error:",
      err?.response?.data||err.message
    );

    await sock.sendMessage(remoteJid,{
      text:
`⚠️ Maaf , terjadi kesalahan saat mendownload lagu Spotify.

💡 Detail Error :
${err?.message}`
    },{ quoted:m });

    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:m.key }
    });
  }
}

export default {
  handle,
  Commands: ["spotify", "spotifydl", "spotdl", "spotdl"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 0
};


/*
Name Fitur : Spotify Download [ Via Url ]
Type Code : cjs
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");

async function handle(sock, messageInfo) {

  const {
    m,
    remoteJid,
    prefix,
    command,
    content
  } = messageInfo;

  const url = content?.trim();

  if (!url) {
    return await sock.sendMessage(remoteJid,{
      text:
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* url_spotify

💬 *Contoh :*
${prefix + command} https://open.spotify.com/track/abcdefg12345`
    },{ quoted:m });
  }

  try {

    await sock.sendMessage(remoteJid,{
      react:{ text:"🎵", key:m.key }
    });

    const apiUrl =
`https://api.nexray.web.id/downloader/v1/spotify?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.status) {
      throw new Error("Gagal mengambil data lagu");
    }

    const result = data.result;

    const title = result.title;
    const artist = result.artist?.join(", ");
    const album = result.album;
    const release = result.release_at;
    const thumbnail = result.thumbnail;
    const audioUrl = result.url;

    const durationSec = Math.floor(result.duration / 1000);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;

    const duration =
`${minutes}:${seconds.toString().padStart(2,"0")}`;

    let sizeText;

    if (result.size >= 1024 * 1024) {
      sizeText =
(result.size / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      sizeText =
(result.size / 1024).toFixed(2) + " KB";
    }

    const infoMsg = await sock.sendMessage(remoteJid,{
      image:{ url:thumbnail },
      caption:
`🎵 *Spotify Downloader*

📀 Title : ${title}
🎤 Artist : ${artist}
💽 Album : ${album}
📅 Release : ${release}
⏱ Duration : ${duration}
📦 Size : ${sizeText}`
    },{ quoted:m });

    await sock.sendMessage(remoteJid,{
      audio:{ url:audioUrl },
      mimetype:"audio/mpeg",
      fileName:`${title}.mp3`
    },{
      quoted:infoMsg
    });

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:m.key }
    });

  } catch (err) {
    console.error(
      "Spotify Downloader Error:",
      err?.response?.data||err.message
    );

    await sock.sendMessage(remoteJid,{
      text:
`⚠️ Maaf , terjadi kesalahan saat mendownload lagu Spotify.

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
  Commands: ["spotify", "spotifydl", "spotdl", "spotdl"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 0
};


/*
Name Fitur : Spotify Download [ Via Url ]
Type Code : case
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "spotify":
case "spotifydl":
case "spotdl":
case "spotdl": {

  const url = text?.trim();

  if (!url) {
    return await sock.sendMessage(m.chat,{
      text:
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* url_spotify

💬 *Contoh :*
${prefix + command} https://open.spotify.com/track/abcdefg12345`
    },{ quoted:m });
  }

  try {

    await sock.sendMessage(m.chat,{
      react:{ text:"🎵", key:m.key }
    });

    const apiUrl =
`https://api.nexray.web.id/downloader/v1/spotify?url=${encodeURIComponent(url)}`;

    const { data } = await axios.get(apiUrl);

    if (!data?.status) {
      throw new Error("Gagal mengambil data lagu");
    }

    const result = data.result;

    const title = result.title;
    const artist = result.artist?.join(", ");
    const album = result.album;
    const release = result.release_at;
    const thumbnail = result.thumbnail;
    const audioUrl = result.url;

    const durationSec = Math.floor(result.duration / 1000);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;

    const duration =
`${minutes}:${seconds.toString().padStart(2,"0")}`;

    let sizeText;

    if (result.size >= 1024 * 1024) {
      sizeText =
(result.size / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      sizeText =
(result.size / 1024).toFixed(2) + " KB";
    }

    const infoMsg = await sock.sendMessage(m.chat,{
      image:{ url:thumbnail },
      caption:
`🎵 *Spotify Downloader*

📀 Title : ${title}
🎤 Artist : ${artist}
💽 Album : ${album}
📅 Release : ${release}
⏱ Duration : ${duration}
📦 Size : ${sizeText}`
    },{ quoted:m });

    await sock.sendMessage(m.chat,{
      audio:{ url:audioUrl },
      mimetype:"audio/mpeg",
      fileName:`${title}.mp3`
    },{
      quoted:infoMsg
    });

    await sock.sendMessage(m.chat,{
      react:{ text:"✅", key:m.key }
    });

  } catch (err) {
    console.error(
      "Spotify Downloader Error:",
      err?.response?.data||err.message
    );

    await sock.sendMessage(m.chat,{
      text:
`⚠️ Maaf , terjadi kesalahan saat mendownload lagu Spotify.

💡 Detail Error :
${err?.message}`
    },{ quoted:m });

    await sock.sendMessage(m.chat,{
      react:{ text:"❌", key:m.key }
    });
  }

}
break;