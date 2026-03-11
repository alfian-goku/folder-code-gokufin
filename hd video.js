/*
Name Fitur : hd video [ support reply & url video ]
Type Code : esm
Created By : alfian
Note : jika script kalian gak support download vidio secara langsung , kalian bisa hapus code dengan barisan atau di bawah kata "OPSIONAL" di bawah ini , jadi nanti hasilnya only url vidio saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js"; // opsional

fs.ensureDirSync("tmp");

//======================
// UPLOAD TMPFILES | OPSIONAL
//======================
async function uploadTmpfiles(filePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://tmpfiles.org/api/v1/upload",
      form,
      { headers: form.getHeaders() }
    );

    let url = res.data?.data?.url;

    if (!url) return false;

    url = url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

    return url;

  } catch (err) {
    console.error("Upload TmpFiles Error :", err?.response?.data||err.message);
    return false;
  }
}

//======================
// HANDLE COMMAND
//======================
async function handle(sock, messageInfo) {

  const { remoteJid, message, content, prefix, command, isQuoted, type } = messageInfo;

  try {
    let videoUrl;
    let resolusi;

    //======================
    // PARSE PARAMETER
    //======================
    if (content?.includes("|")) {

      const parts = content.split("|");

      resolusi = parts[0]?.trim()?.toLowerCase();
      videoUrl = parts[1]?.trim();

    } else {
      resolusi = content?.trim()?.toLowerCase();
    }

    //======================
    // NORMALISASI RESOLUSI
    //======================
    if (resolusi === "full"||resolusi === "hd2") {
      resolusi = "full-hd";
    }

    if (!["hd","full-hd"].includes(resolusi)) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format Penggunaan :*

📍 *Parameter :* 
*${prefix + command}* <url video>

💬 *Contoh 1 : Reply Video*
*${prefix + command}* hd
━━━━━━━━━━━━━━━
*${prefix + command}* full

💬 *Contoh 2 : Url Video*
*${prefix + command}* hd | https://example.com/video.mp4
━━━━━━━━━━━━━━━
*${prefix + command}* full | https://example.com/video.mp4`
        },
        { quoted: message }
      );
    }

    //======================
    // REPLY VIDEO | OPSIONAL
    //======================
    if (!videoUrl && (isQuoted||type === "video")) {

      const mediaType = isQuoted?.type||type;

      if (mediaType !== "video") {
        return await sock.sendMessage(
          remoteJid,
          { text: "⚠️ Kirim atau reply *video* terlebih dahulu." },
          { quoted: message }
        );
      }

        // React 
     await sock.sendMessage(remoteJid,{
        react:{ text:"🕖", key:message.key }
      });

        // Jika pakai url video
      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message);

      if (!fileName) throw new Error("Gagal download media");

      const filePath = path.join("tmp", fileName);

      const uploadUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);

      if (!uploadUrl) throw new Error("Upload video gagal");

      videoUrl = uploadUrl;
    }

    if (!videoUrl) {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Url video tidak ditemukan." },
        { quoted: message }
      );
    }

      // React 1
    await sock.sendMessage(remoteJid,{
      react:{ text:"🕖", key:message.key }
    });

    //======================
    // CALL API
    //======================
    const api =
`https://api.nexray.web.id/tools/v1/hdvideo?url=${encodeURIComponent(videoUrl)}&resolusi=${resolusi}`;

    const { data } = await axios.get(api);

    if (!data?.result) throw new Error("Api tidak mengembalikan video");

    //======================
    // KIRIM HASIL
    //======================
    await sock.sendMessage(
      remoteJid,
      {
        video:{ url:data.result },
        caption:
`✨ *Video berhasil ditingkatkan kualitasnya*

🎥 *Resolusi :* ${resolusi.toUpperCase()}`
      },
      { quoted: message }
    );

      // react sukses
    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Hd Video Error :", err?.response?.data||err.message);

    // Kirim text eror ke user beserta code erornya
    await sock.sendMessage(remoteJid,{
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
    },{ quoted: message });

    // Kirim reaction eror
    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

export default {
  handle,
  Commands: ["hdvideo", "videohd", "hdvid"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};