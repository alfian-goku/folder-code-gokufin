/*
Name Fitur : to hitam
Type Code : esm
Created By : Alfian
Note : kalian sesuaikan saja kodenya dengan struktur script kalian terutama di bagian eksport paling bawah dan kode penting yaitu bagian impor paling atas
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js"; // opsional

fs.ensureDirSync("tmp");

//======================
// UPLOAD TMPFILES
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

    // ubah ke direct link
    url = url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

    return url;

  } catch (err) {
    console.error("Upload TmpFiles error:", err?.response?.data || err.message);
    return false;
  }
}

//======================
// HANDLE COMMAND
//======================
async function handle(sock, messageInfo) {

  const {
    remoteJid,
    message,
    content,
    isQuoted,
    prefix,
    command,
    type
  } = messageInfo;

  try {

    let imageUrl = null;

    //======================
    // JIKA URL
    //======================
    if (content && /^https?:\/\//i.test(content)) {
      imageUrl = content.trim();
    }

    //======================
    // JIKA MEDIA
    //======================
    else {

      const mediaType = isQuoted ? isQuoted.type : type;

      if (mediaType !== "image") {

        return await sock.sendMessage(
          remoteJid,
          {
            text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
1. Reply gambar
2. Kirim url gambar

💬 *Contoh :*
*${prefix + command}*  https://example.com/image.jpg`
          },
          { quoted: message }
        );
      }

      await sock.sendMessage(remoteJid,{
        react:{ text:"🕒", key:message.key }
      });

      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message);

      const filePath = path.join("tmp", fileName);

      imageUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);

      if (!imageUrl) throw new Error("Upload gambar gagal");
    }

    const api =
`https://api-faa.my.id/faa/tohitam?url=${encodeURIComponent(imageUrl)}`;

    await sock.sendMessage(
      remoteJid,
      {
        image:{ url: api },
        caption:`🖤 *Berhasil menghitamkan gambar*`
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {

   console.error("To Hitam Error :", err?.response?.data || err.message);

    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

export default {
  handle ,
  Commands:["tohitam", "hitamkan"] ,
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2
};

========

/*
Name Fitur : to hitam
Type Code : cjs
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia } = require("../../lib/utils.js");

fs.ensureDirSync("tmp");

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
    console.error("Upload TmpFiles error:", err?.response?.data || err.message);
    return false;
  }
}

async function handle(sock, messageInfo) {

  const {
    remoteJid,
    message,
    content,
    isQuoted,
    prefix,
    command,
    type
  } = messageInfo;

  /* isi logic sama seperti versi esm */

}

module.exports = {
  handle ,
  Commands:["tohitam","hitamkan"],
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2
};

/*
Name Fitur : to hitam
Type Code : case
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "tohitam":
case "hitamkan": {

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia } = require("../../lib/utils.js");

fs.ensureDirSync("tmp");

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
    console.error("Upload TmpFiles error:", err?.response?.data || err.message);
    return false;
  }
}

try {

  let imageUrl = null;

  if (text && /^https?:\/\//i.test(text)) {
    imageUrl = text.trim();
  }

  else {

    const mediaType = m.quoted ? m.quoted.mtype : m.mtype;

    if (mediaType !== "imageMessage") {

      return sock.sendMessage(
        m.chat,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
1. Reply gambar
2. Kirim url gambar

💬 *Contoh :*
*${prefix + command}* https://example.com/image.jpg`
        },
        { quoted:m }
      );
    }

    await sock.sendMessage(m.chat,{
      react:{ text:"🕒", key:m.key }
    });

    const fileName = m.quoted
      ? await downloadQuotedMedia(m)
      : await downloadMedia(m);

    const filePath = path.join("tmp", fileName);

    imageUrl = await uploadTmpfiles(filePath);

    fs.unlinkSync(filePath);

    if (!imageUrl) throw new Error("Upload gambar gagal");
  }

  const api =
`https://api-faa.my.id/faa/tohitam?url=${encodeURIComponent(imageUrl)}`;

  await sock.sendMessage(
    m.chat,
    {
      image:{ url: api },
      caption:`🖤 *Berhasil menghitamkan gambar*`
    },
    { quoted:m }
  );

  await sock.sendMessage(m.chat,{
    react:{ text:"✅", key:m.key }
  });

} catch (err) {

  console.error("To Hitam Error :", err?.response?.data || err.message);

  await sock.sendMessage(
    m.chat,
    {
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
    },
    { quoted:m }
  );

  await sock.sendMessage(m.chat,{
    react:{ text:"❌", key:m.key }
  });

}

}
break;