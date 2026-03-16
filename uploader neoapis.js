/*
Name Fitur : uploader neapis
Type Code : esm
Created By : alfian
Note : sesuaikan saja struktur code ini dengan struktur codemu. expiry yang tersedia = 6h ( 6 jam ) , 24h ( 24 Jam ) , 7d ( 1 Minggu ) , 30d ( 1 bulan ) dan permanent ( selamanya )
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia, reply } from "../../lib/utils.js"; // opsional

//=====================================
// UPLOAD NEOAPIS
//=====================================
async function uploadNeoapis(filePath, expiry = "permanent") {
    try {
        if (!filePath) throw new Error("File path tidak ditemukan");
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));
        form.append("expiry", expiry);

        const response = await axios.post(
            "https://neoapis.my.id/uploader/upload",
            form,
            {
                headers: {
                    ...form.getHeaders()
                },
                timeout: 120000,
                maxBodyLength: Infinity
            }
        );

        const data = response.data;
        if (!data?.status || !data?.url) return false;

        return data.url;

    } catch (err) {
        console.error("Upload Neoapis Eror :", err?.response?.data || err.message);
        return false;
    }
}

//=====================================
// CODE HANDLE
//=====================================
async function handle(sock, messageInfo) {
  const { m, remoteJid, message, isQuoted, type, prefix, command } = messageInfo;
  let mediaPath;

    // Atur type upload & text format penggunaan
  try {
    const mediaType = isQuoted ? isQuoted.type : type;
    if (!['image', 'video', 'audio', 'document', 'sticker'].includes(mediaType)) {
      return await reply(m, `⚠️ *Format penggunaan :*\n\n 📍 *Parameter :*\n Kirim media atau reply media dengan caption *${prefix + command}*`);
    }

      // Reaction Loading
    await sock.sendMessage(remoteJid, { react: { text: "🔗", key: message.key } });

      // Download media dari request
    const mediaFilename = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);
    mediaPath = path.join('tmp', mediaFilename);
     
       // Berikan text eror ke pengguna ( gagal download media )
    if (!fs.existsSync(mediaPath)) {
      throw new Error("file media tidak ditemukan setelah diunduh.");
    }

      // Upload ke neoapis
    const resultUrl = await uploadNeoapis(mediaPath);

     // Kirim text sukses ke user
    await reply(
      m,
`✅ *_Upload ke neoapis berhasil_*\n
📎 *Link*: ${resultUrl}`
    );
      
     // Reaction sukses
    await sock.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
      
    // berikan code eror yang komplit
  } catch (err) {
    console.error("Upload Neoapis Error :", err?.response?.data || err.message);
      
   // Kirim text eror ke pengguna
    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda. Coba lagi beberapa saat!

💡 Detail Error :
${err?.message}`
      },
      { quoted: message }
    );
      
     // Reaction eror
    await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
  }
}

  // Code export ( esm )
export default {
  handle,
  Commands: ["neoapis", "upneo"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};

/*
Name Fitur : uploader neapis
Type Code : cjs
Created By : alfian
Note : sesuaikan saja struktur code ini dengan struktur codemu. expiry yang tersedia = 6h ( 6 jam ) , 24h ( 24 Jam ) , 7d ( 1 Minggu ) , 30d ( 1 bulan ) dan permanent ( selamanya )
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia, reply  } = require("../../lib/utils"); // opsional

//=====================================
// UPLOAD NEOAPIS
//=====================================
async function uploadNeoapis(filePath, expiry = "permanent") {
    try {
        if (!filePath) throw new Error("File path tidak ditemukan");
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));
        form.append("expiry", expiry);

        const response = await axios.post(
            "https://neoapis.my.id/uploader/upload",
            form,
            {
                headers: {
                    ...form.getHeaders()
                },
                timeout: 120000,
                maxBodyLength: Infinity
            }
        );

        const data = response.data;
        if (!data?.status || !data?.url) return false;

        return data.url;

    } catch (err) {
  console.error("Upload Neoapis Eror :", err?.response?.data || err.message);
        return false;
    }
}

//=====================================
// CODE HANDLE
//=====================================
async function handle(sock, messageInfo) {
  const { m, remoteJid, message, isQuoted, type, prefix, command } = messageInfo;
  let mediaPath;

    // Atur type upload & text format penggunaan
  try {
    const mediaType = isQuoted ? isQuoted.type : type;
    if (!['image', 'video', 'audio', 'document', 'sticker'].includes(mediaType)) {
      return await reply(m, `⚠️ *Format penggunaan :*\n\n 📍 *Parameter :*\n Kirim media atau reply media dengan caption *${prefix + command}*`);
    }

      // Reaction Loading
    await sock.sendMessage(remoteJid, { react: { text: "🔗", key: message.key } });

      // Download media dari request
    const mediaFilename = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);
    mediaPath = path.join('tmp', mediaFilename);
     
       // Berikan text eror ke pengguna ( gagal download media )
    if (!fs.existsSync(mediaPath)) {
      throw new Error("file media tidak ditemukan setelah diunduh.");
    }

      // Upload ke neoapis
    const resultUrl = await uploadNeoapis(mediaPath);

     // Kirim text sukses ke user
    await reply(
      m,
`✅ *_Upload ke neoapis berhasil_*\n
📎 *Link*: ${resultUrl}`
    );
      
     // Reaction sukses
    await sock.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
      
    // berikan code eror yang komplit
  } catch (err) {
    console.error("Upload Neoapis Error :", err?.response?.data || err.message);
      
   // Kirim text eror ke pengguna
    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda. Coba lagi beberapa saat!

💡 Detail Error :
${err?.message}`
      },
      { quoted: message }
    );
      
     // Reaction eror
    await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
  }
}

module.exports = {
  handle,
  Commands: ["neoapis", "upneo"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};