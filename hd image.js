/*
Name Fitur : hd image
Type Code : esm
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code dengan ada kata atau di bawah kata "OPSIONAL" di bawah ini , jadi nanti hasilnya only url image saja.
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
    let imageUrl;

    //======================
    // MEDIA (REPLY / KIRIM) | OPSIONAL
    //======================
    if (isQuoted||type === "image") {

      const mediaType = isQuoted?.type||type;

      if (mediaType !== "image") {
        return await sock.sendMessage(
          remoteJid,
          { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
          { quoted: message }
        );
      }

        // reaction
     await sock.sendMessage(remoteJid,{
        react:{ text:"🪄", key:message.key }
      });

      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message);

      if (!fileName) throw new Error("Gagal download media");

      const filePath = path.join("tmp", fileName);

      const uploadUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);

      if (!uploadUrl) throw new Error("Upload gambar gagal");

      imageUrl = uploadUrl;
    }

    //======================
    // URL IMAGE
    //======================
    else {

      const url = content?.trim();

      if (!url) {
        return await sock.sendMessage(
          remoteJid,
          {
            text:
`⚠️ *Format Penggunaan :*

📍 *Parameter :* 
*${prefix + command}* <url image>

💬 *Contoh 1 : Reply Image*
*${prefix + command}*

💬 *Contoh 2 : Url Image*
*${prefix + command}* https://example.com/image.jpg`
          },
          { quoted: message }
        );
      }

      imageUrl = url;

      await sock.sendMessage(remoteJid,{
        react:{ text:"🪄", key:message.key }
      });
    }

    //======================
    // CALL API REMINI
    //======================
    const api =
`https://api.nexray.web.id/tools/remini?url=${encodeURIComponent(imageUrl)}`;

    const { data } = await axios.get(api,{
      responseType:"arraybuffer"
    });

    //======================
    // KIRIM HASIL
    //======================
    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(data),
        caption: "✨ *Foto berhasil ditingkatkan kualitasnya*"
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Hd Image Error :", err?.response?.data||err.message);

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

// sesuaikan saja dengan struktur scriptmu
export default {
  handle,
  Commands: ["remini", "hd"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};

/*
Name Fitur : hd image
Type Code : esm
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code dengan ada kata atau di bawah kata "OPSIONAl" di bawah ini , jadi nanti hasilnya only url image saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia  } = require("../../lib/utils"); // opsional

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
    let imageUrl;

    //======================
    // MEDIA (REPLY / KIRIM) | OPSIONAL
    //======================
    if (isQuoted||type === "image") {

      const mediaType = isQuoted?.type||type;

      if (mediaType !== "image") {
        return await sock.sendMessage(
          remoteJid,
          { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
          { quoted: message }
        );
      }

        // reaction
     await sock.sendMessage(remoteJid,{
        react:{ text:"🪄", key:message.key }
      });

      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message);

      if (!fileName) throw new Error("Gagal download media");

      const filePath = path.join("tmp", fileName);

      const uploadUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);

      if (!uploadUrl) throw new Error("Upload gambar gagal");

      imageUrl = uploadUrl;
    }

    //======================
    // URL IMAGE
    //======================
    else {

      const url = content?.trim();

      if (!url) {
        return await sock.sendMessage(
          remoteJid,
          {
            text:
`⚠️ *Format Penggunaan :*

📍 *Parameter :* 
*${prefix + command}* <url image>

💬 *Contoh 1 : Reply Image*
*${prefix + command}*

💬 *Contoh 2 : Url Image*
*${prefix + command}* https://example.com/image.jpg`
          },
          { quoted: message }
        );
      }

      imageUrl = url;

      await sock.sendMessage(remoteJid,{
        react:{ text:"🪄", key:message.key }
      });
    }

    //======================
    // CALL API REMINI
    //======================
    const api =
`https://api.nexray.web.id/tools/remini?url=${encodeURIComponent(imageUrl)}`;

    const { data } = await axios.get(api,{
      responseType:"arraybuffer"
    });

    //======================
    // KIRIM HASIL
    //======================
    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(data),
        caption: "✨ *Foto berhasil ditingkatkan kualitasnya*"
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Hd Image Error :", err?.response?.data||err.message);

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

// sesuaikan saja dengan struktur scriptmu
module.exports = {
  handle,
  Commands: ["remini", "hd"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};

/*
Name Fitur : hd image
Type Code : case
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code dengan ada kata atau di bawah kata "OPSIONAL" di bawah ini , jadi nanti hasilnya only url image saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "remini":
case "hd": {

const axios = require("axios"); // wajib
const fs = require("fs-extra"); // opsional
const path = require("path");  // opsi
const FormData = require("form-data"); // opsi
const { downloadQuotedMedia, downloadMedia } = require("../../lib/utils.js"); // opsional

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

try {

  const remoteJid = m.chat;
  const message = m;
  const content = text;
  const isQuoted = m.quoted;
  const type = m.mtype;

  let imageUrl;

  //======================
  // MEDIA (REPLY / KIRIM) | OPSIONAL
  //======================
  if (isQuoted||type === "imageMessage") {

    const mediaType = isQuoted?.mimetype||m.mimetype;

    if (!mediaType?.includes("image")) {
      return await sock.sendMessage(
        remoteJid,
        { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
        { quoted: message }
      );
    }

    // reaction
    await sock.sendMessage(remoteJid,{
      react:{ text:"🪄", key:message.key }
    });

    const fileName = isQuoted
      ? await downloadQuotedMedia(message)
      : await downloadMedia(message);

    if (!fileName) throw new Error("Gagal download media");

    const filePath = path.join("tmp", fileName);

    const uploadUrl = await uploadTmpfiles(filePath);

    fs.unlinkSync(filePath);

    if (!uploadUrl) throw new Error("Upload gambar gagal");

    imageUrl = uploadUrl;
  }

  //======================
  // URL IMAGE
  //======================
  else {

    const url = content?.trim();

    if (!url) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format Penggunaan :*

📍 *Parameter :* 
*${prefix + command}* <url image>

💬 *Contoh 1 : Reply Image*
*${prefix + command}*

💬 *Contoh 2 : Url Image*
*${prefix + command}* https://example.com/image.jpg`
        },
        { quoted: message }
      );
    }

    imageUrl = url;

    await sock.sendMessage(remoteJid,{
      react:{ text:"🪄", key:message.key }
    });
  }

  //======================
  // CALL API REMINI
  //======================
  const api =
`https://api.nexray.web.id/tools/remini?url=${encodeURIComponent(imageUrl)}`;

  const { data } = await axios.get(api,{
    responseType:"arraybuffer"
  });

  //======================
  // KIRIM HASIL
  //======================
  await sock.sendMessage(
    remoteJid,
    {
      image: Buffer.from(data),
      caption: "✨ *Foto berhasil ditingkatkan kualitasnya*"
    },
    { quoted: message }
  );

  await sock.sendMessage(remoteJid,{
    react:{ text:"✅", key:message.key }
  });

} catch (err) {

  console.error("Hd Image Error :", err?.response?.data||err.message);

  await sock.sendMessage(remoteJid,{
    text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
  },{ quoted: message });

  await sock.sendMessage(remoteJid,{
    react:{ text:"❌", key:message.key }
  });

}

}
break;