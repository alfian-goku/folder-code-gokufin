/*
Name Fitur : nano banana [ ai ]
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia, reply } from "../../lib/utils.js";
import { logCustom } from "../../lib/logger.js";

fs.ensureDirSync("tmp");

//======================
// UPLOAD CLUGO
//======================
async function uploadClugo(filePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://www.clugo.my.id/upload",
      form,
      { headers: form.getHeaders() }
    );

    return (
      res.data?.url||res.data?.file||res.data?.result||false
    );

  } catch (err) {
    console.error("Clugo upload error:", err.message);
    return false;
  }
}

//======================
// HANDLE COMMAND
//======================
async function handle(sock, messageInfo) {
  const { remoteJid, message, content, prefix, command, isQuoted, type } = messageInfo;

  try {

    // format penggunaan
    if (!content) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ _Format penggunaan_ :

📸 Reply/Kirim gambar + prompt

💬 Contoh :
*${prefix + command}* ubah jadi anime

⏳ *Catatan :*  
AI ini memiliki cooldown jadi tunggu beberapa detik jika gagal.`
        },
        { quoted: message }
      );
    }

    //======================
    // VALIDASI MEDIA
    //======================
    const mediaType = isQuoted ? isQuoted.type : type;

    if (mediaType !== "image") {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🎨", key: message.key }
    });

    //======================
    // DOWNLOAD MEDIA
    //======================
    const fileName = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    const filePath = path.join("tmp", fileName);

    //======================
    // UPLOAD MEDIA
    //======================
    const imageUrl = await uploadClugo(filePath);

    fs.unlinkSync(filePath);

    if (!imageUrl) throw new Error("Upload gambar gagal");

    //======================
    // CALL API NANOBANANA
    //======================
    const api =
`https://api.snowping.my.id/api/imageai/nanobanana?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(content)}`;

    let response = await axios.get(api);
    let image = response.data?.result?.image;

    //======================
    // RETRY JIKA IMAGE BELUM ADA
    //======================
    if (!image) {

      // tunggu render AI
      await new Promise(resolve => setTimeout(resolve, 7000));

      const retry = await axios.get(api);
      image = retry.data?.result?.image;
    }

    if (!image) {
      throw new Error("API tidak mengembalikan gambar (AI masih cooldown)");
    }

    //======================
    // KIRIM HASIL
    //======================
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: image },
        caption:
`*Nano Banana ai berhasil dibuat ✅*

🎨 *Prompt :* ${content}
> *Powered By Gokufin*`
      },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key }
    });

  } catch (err) {
    console.error("Nano Banana Error:", err?.response?.data||err.message);

    logCustom("info", content, `ERROR-COMMAND-${command}.txt`);

    const errorMessage =
`⚠️ Maaf, terjadi kesalahan saat memproses permintaan anda.

💡 Kemungkinan eror :
• Server ai sedang cooldown
• Gambar belum selesai dirender
• Gagal upload media ke uploder
> *_Silakan coba lagi beberapa menit kedepan._*`;

      // kirim text eror
    await sock.sendMessage(remoteJid, { text: errorMessage }, { quoted: message });

      // kirim reaction eror
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key }
    });
  }
}

export default {
  handle,
  Commands: ["nanobanana", "banana", "nano"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 2
};

/*
Name Fitur : nano banana [ ai ]
Type Code : cjs
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia, reply  } = require("../../lib/utils");
const { logCustom  } = require("../../lib/logger");

fs.ensureDirSync("tmp");

//======================
// UPLOAD CLUGO
//======================
async function uploadClugo(filePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://www.clugo.my.id/upload",
      form,
      { headers: form.getHeaders() }
    );

    return (
      res.data?.url||res.data?.file||res.data?.result||false
    );

  } catch (err) {
    console.error("Clugo upload error:", err.message);
    return false;
  }
}

//======================
// HANDLE COMMAND
//======================
async function handle(sock, messageInfo) {
  const { remoteJid, message, content, prefix, command, isQuoted, type } = messageInfo;

  try {

    // format penggunaan
    if (!content) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ _Format penggunaan_ :

📸 Reply/Kirim gambar + prompt

💬 Contoh :
*${prefix + command}* ubah jadi anime

⏳ *Catatan :*  
AI ini memiliki cooldown jadi tunggu beberapa detik jika gagal.`
        },
        { quoted: message }
      );
    }

    //======================
    // VALIDASI MEDIA
    //======================
    const mediaType = isQuoted ? isQuoted.type : type;

    if (mediaType !== "image") {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🎨", key: message.key }
    });

    //======================
    // DOWNLOAD MEDIA
    //======================
    const fileName = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    const filePath = path.join("tmp", fileName);

    //======================
    // UPLOAD MEDIA
    //======================
    const imageUrl = await uploadClugo(filePath);

    fs.unlinkSync(filePath);

    if (!imageUrl) throw new Error("Upload gambar gagal");

    //======================
    // CALL API NANOBANANA
    //======================
    const api =
`https://api.snowping.my.id/api/imageai/nanobanana?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(content)}`;

    let response = await axios.get(api);
    let image = response.data?.result?.image;

    //======================
    // RETRY JIKA IMAGE BELUM ADA
    //======================
    if (!image) {

      // tunggu render AI
      await new Promise(resolve => setTimeout(resolve, 7000));

      const retry = await axios.get(api);
      image = retry.data?.result?.image;
    }

    if (!image) {
      throw new Error("API tidak mengembalikan gambar (AI masih cooldown)");
    }

    //======================
    // KIRIM HASIL
    //======================
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: image },
        caption:
`*Nano Banana ai berhasil dibuat ✅*

🎨 *Prompt :* ${content}
> *Powered By Gokufin*`
      },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key }
    });

  } catch (err) {
    console.error("Nano Banana Error:", err?.response?.data||err.message);

    logCustom("info", content, `ERROR-COMMAND-${command}.txt`);

    const errorMessage =
`⚠️ Maaf, terjadi kesalahan saat memproses permintaan anda.

💡 Kemungkinan eror :
• Server AI sedang cooldown
• Gambar belum selesai dirender
• Gagal upload media ke uploder
> *_Silakan coba lagi beberapa menit kedepan._*`;

      // kirim text eror
    await sock.sendMessage(remoteJid, { text: errorMessage }, { quoted: message });

      // kirim reaction eror
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key }
    });
  }
}

module.exports = {
  handle,
  Commands: ["nanobanana", "banana", "nano"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 2
};
