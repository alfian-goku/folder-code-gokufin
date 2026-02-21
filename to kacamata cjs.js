/*
Name Fitur : to kacamata
Type Code :cjs
Base Api : faa
Created By : Alfian
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadMedia, downloadQuotedMedia, reply } = require("../../lib/utils");

/* UPLOAD AUTORESBOT */
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
  const {
    m,
    message,
    remoteJid,
    isQuoted,
    type,
    prefix,
    command
  } = messageInfo;

  try {
    const mediaType = isQuoted ? isQuoted.type : type;

    if (mediaType !== "image") {
      return reply(
        m,
`⚠️ *Format Penggunaan:*

🖼️ Kirim / reply gambar dengan caption:
*${prefix + command}*`
      );
    }

    // 🕶️ reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🕶️", key: message.key }
    });

    // download image
    const media = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    const mediaPath = path.join("tmp", media);
    if (!fs.existsSync(mediaPath)) throw "File tidak ditemukan";

    // upload image
    const imageUrl = await uploadAutoresbot(mediaPath);
    fs.unlinkSync(mediaPath);

    if (!imageUrl) throw "Upload gagal";

    // call API FAA
    const apiUrl =
      `https://api-faa.my.id/faa/tokacamata?url=${encodeURIComponent(imageUrl)}`;

    // kirim hasil
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: apiUrl },
        caption: "🕶️ *Kacamata berhasil ditambahkan*"
      },
      { quoted: message }
    );

    // ✅ reaction selesai
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key }
    });

  } catch (err) {
    console.error("To kacamata error:", err?.response?.data || err.message);

 // Kirim pemberitahuan ke user
    // ==============================
    await sock.sendMessage(
      remoteJid,
      { text: '⚠️ Terjadi keselahan saat memproses gambar!' },
      { quoted: message }
    );
    
  //  reaction eror
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key }
    });
  }
}

module.exports = {
  handle,
  Commands: ["tokacamata", "kacamata"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};
