/*
Name Fitur : to jepang
Type Code : esm
Base Api : faa
Created By : alfian
*/

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { downloadQuotedMedia, downloadMedia, reply } from "../../lib/utils.js"; // fungsi untuk download media pengguna, sesuaikan dengan struktur SC kalian aja

//==== UPLOAD KE AUTORESBOT ===========
async function uploadAutoresbot(filePath) {
    try {
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));

        const res = await axios.put(
            "https://autoresbot.com/tmp-files/upload",
            form,
            { headers: form.getHeaders() }
        );

        return res.data?.data?.url||false;
    } catch {
        return false;
    }
}

async function handle(sock, messageInfo) {
  const { m, remoteJid, message, isQuoted, type, prefix, command } = messageInfo;

  const mediaType = isQuoted ? isQuoted.type : type;
  if (!["image", "imageMessage"].includes(mediaType)) {
    return reply(m, `⚠️ Reply foto dengan caption *${prefix + command}*`);
  }

  // beri reaction loading tema Jepang
  try {
    await sock.sendMessage(remoteJid, {
      react: { text: "🇯🇵", key: message.key }
    });

    // mendownload media yang dikirim oleh pengguna ( dgn import util.js )
    const media = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    //  upload media ke autoresbot
    const imgUrl = await uploadAutoresbot(mediaPath);
    if (!imgUrl) throw new Error("Upload gagal");

  // memanggil api
    const api = `https://api-faa.my.id/faa/tojepang?url=${encodeURIComponent(imgUrl)}`;
    const res = await axios.get(api, { responseType: "arraybuffer" });

    // kirim hasil ke pengguna
    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(res.data),
        caption: "🇯🇵 *Kini foto kamu sedang berada di Jepang*\n> *Tunggu apalagi gaskuen pamer ke teman*"
      },
      { quoted: message }
    );

      // reaction selesai 
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key }
    });

  } catch (err) {
    console.error("to jepang error:", err?.response?.data || err.message);

    // kirim pemberitahuan error ke pengguna
    await sock.sendMessage(
      remoteJid,
      { text: "❌ Gagal memproses foto Jepang." },
      { quoted: message }
    );

    // reaction eror
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key }
    });
  }
}

// bagian ini ubah eksportnya sesuai dengan script kalian
export default {
  handle,
  Commands: ["tojepang", "jepang"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};

𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝𓆟𓆝

/*
Name Fitur : to jepang
Type Code : cjs
Base Api : api-faa
Created By : alfian
*/

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { downloadQuotedMedia, downloadMedia, reply  } = require("../../lib/utils"); // fungsi untuk download media pengguna, sesuaikan dengan struktur SC kalian aja

//==== UPLOAD KE AUTORESBOT ===========
async function uploadAutoresbot(filePath) {
    try {
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));

        const res = await axios.put(
            "https://autoresbot.com/tmp-files/upload",
            form,
            { headers: form.getHeaders() }
        );

        return res.data?.data?.url||false;
    } catch {
        return false;
    }
}

async function handle(sock, messageInfo) {
  const { m, remoteJid, message, isQuoted, type, prefix, command } = messageInfo;

  const mediaType = isQuoted ? isQuoted.type : type;
  if (!["image", "imageMessage"].includes(mediaType)) {
    return reply(m, `⚠️ Reply foto dengan caption *${prefix + command}*`);
  }

  // beri reaction loading dengan tema Jepang
  try {
    await sock.sendMessage(remoteJid, {
      react: { text: "🇯🇵", key: message.key }
    });

    const media = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    const mediaPath = path.join("tmp", media);
    const imgUrl = await uploadAutoresbot(mediaPath);
    if (!imgUrl) throw new Error("Upload gagal");

    const api = `https://api-faa.my.id/faa/tojepang?url=${encodeURIComponent(imgUrl)}`;
    const res = await axios.get(api, { responseType: "arraybuffer" });

    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(res.data),
        caption: "🇯🇵 *Kini foto kamu sedang berada di Jepang*\n> *Tunggu apalagi gaskuen pamer ke teman*"
      },
      { quoted: message }
    );

      // reaction selesai 
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key }
    });

  } catch (err) {
    console.error("to jepang error:", err?.response?.data || err.message);

    // kirim pemberitahuan eror ke pengguna
    await sock.sendMessage(
      remoteJid,
      { text: "❌ Gagal memproses foto Jepang." },
      { quoted: message }
    );

    // reaction eror 
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key }
    });
  }
}

module.exports = {
  handle,
  Commands: ["tojepang", "jepang"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};
