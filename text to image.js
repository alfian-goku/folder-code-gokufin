/*
Name Fitur : text2image
Type Code : esm
Base Api : snowping
Created By : alfian
Note : jangan hapus pembuat code hargai yang buat codenya
*/

import axios from "axios";

const BASE_URL = "https://api.snowping.my.id/api/imageai/text2image";

async function handle(sock, messageInfo) {
  const { remoteJid, message, prefix, command, content } = messageInfo;

  try {
    if (!content || !content.trim()) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
            `*_⚠️ Format Penggunaan :_*\n` + `📍 Format : prompt > style > size atau only <prompt>\n\n` +
            `💬 Contoh 1 : *${prefix + command}* buatkan saya gambar mobil\n` +
            `💬 Contoh 2 : *${prefix + command}* buatkan saya gambar mobil | default | 1:1\n` +
            `💬 Contoh 3 : *${prefix + command}* buatkan saya gambar mobil | ghibli | 3:2\n` +
            `💬 Contoh 4 : *${prefix + command}* buatkan saya gambar mobil | cyberpunk | 1:1`
        },
        { quoted: message }
      );
    }

    // parsing input
    const parts = content.split("|").map(v => v.trim());

    const prompt = parts[0];
    const style = ["default", "ghibli", "cyberpunk"].includes(parts[1])
      ? parts[1]
      : "default";

    const size = ["1:1", "3:2"].includes(parts[2])
      ? parts[2]
      : "1:1";

    if (!prompt) {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Prompt tidak boleh kosong." },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🎨", key: message.key },
    });

    // request ke endpoint
    const res = await axios.get(BASE_URL, {
      params: {
        prompt,
        style,
        size
      },
      timeout: 60000
    });

    const imageUrl = res.data?.result?.url;
    if (!imageUrl) throw new Error("Image URL tidak ditemukan");

    // kirim image
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: imageUrl },
        caption:
          `🖼️ *Text to Image berhasil dibuat*\n\n` +
          `🎨 Style : ${style}\n` +
          `📦 Size : ${size}\n\n` +
          `📝 Prompt :\n${prompt}`
      },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key },
    });

  } catch (err) {
    console.error("Text2Image Error:", err?.response?.data || err.message);

    // kirim pemberitahuan error
    await sock.sendMessage(
      remoteJid,
      { text: "❌ Terjadi kesalahan saat membuat gambar" },
      { quoted: message }
    );

    // reaction error
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key },
    });
  }
}

export default {
  handle,
  Commands: ["text2img", "texttoimage", "texttoimg", "text2image", "tex2image", "tex2img"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};

//===================================================

/*
Name Fitur : text2image
Type Code : cjs
Base Api : snowping
Created By : alfian
Note : jangan hapus pembuat code hargai yang buat codenya
*/

const axios = require("axios");

const BASE_URL = "https://api.snowping.my.id/api/imageai/text2image";

async function handle(sock, messageInfo) {
  const { remoteJid, message, prefix, command, content } = messageInfo;

  try {
    if (!content || !content.trim()) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
            `*_⚠️ Format Penggunaan :_*\n` + `📍 Format : prompt > style > size atau only <prompt>\n\n` +
            `💬 Contoh 1 : *${prefix + command}* buatkan saya gambar mobil\n` +
            `💬 Contoh 2 : *${prefix + command}* buatkan saya gambar mobil | default | 1:1\n` +
            `💬 Contoh 3 : *${prefix + command}* buatkan saya gambar mobil | ghibli | 3:2\n` +
            `💬 Contoh 4 : *${prefix + command}* buatkan saya gambar mobil | cyberpunk | 1:1`
        },
        { quoted: message }
      );
    }

    // parsing input
    const parts = content.split("|").map(v => v.trim());

    const prompt = parts[0];
    const style = ["default", "ghibli", "cyberpunk"].includes(parts[1])
      ? parts[1]
      : "default";

    const size = ["1:1", "3:2"].includes(parts[2])
      ? parts[2]
      : "1:1";

    if (!prompt) {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Prompt tidak boleh kosong." },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🎨", key: message.key },
    });

    // request ke endpoint
    const res = await axios.get(BASE_URL, {
      params: {
        prompt,
        style,
        size
      },
      timeout: 60000
    });

    const imageUrl = res.data?.result?.url;
    if (!imageUrl) throw new Error("Image URL tidak ditemukan");

    // kirim image
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: imageUrl },
        caption:
          `🖼️ *Text to Image berhasil dibuat*\n\n` +
          `🎨 Style : ${style}\n` +
          `📦 Size : ${size}\n\n` +
          `📝 Prompt :\n${prompt}`
      },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key },
    });

  } catch (err) {
    console.error("Text2Image Error:", err?.response?.data || err.message);

    // kirim pemberitahuan error
    await sock.sendMessage(
      remoteJid,
      { text: "❌ Terjadi kesalahan saat membuat gambar" },
      { quoted: message }
    );

    // reaction error
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key },
    });
  }
}

module.exports = {
  handle,
  Commands: ["text2img", "texttoimage", "texttoimg", "text2image", "tex2image", "tex2img"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};
