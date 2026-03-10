/*
Name Fitur : remove baground
Type Code : esm
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code uploder di bawah ini , jadi nanti hasilnya only url image saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js";

fs.ensureDirSync("tmp");

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
    console.error("Upload TmpFiles Error :", err?.response?.data || err.message);
    return false;
  }
}

async function handle(sock, messageInfo) {

  const {
    remoteJid,
    message,
    content,
    prefix,
    command,
    isQuoted,
    type
  } = messageInfo;

  try {

    let imageUrl;

    if (isQuoted || type === "image") {

      const mediaType = isQuoted?.type || type;

      if (mediaType !== "image") {
        return await sock.sendMessage(
          remoteJid,
          { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
          { quoted: message }
        );
      }

      await sock.sendMessage(remoteJid,{
        react:{ text:"🖼️", key:message.key }
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

    else {

      const url = content?.trim();

      if (!url) {
        return await sock.sendMessage(
          remoteJid,
          {
            text:
`⚠️ *Format Penggunaan :*

1️⃣ Reply gambar
*${prefix + command}*

2️⃣ Kirim URL gambar
*${prefix + command}* https://example.com/image.jpg`
          },
          { quoted: message }
        );
      }

      imageUrl = url;

      await sock.sendMessage(remoteJid,{
        react:{ text:"🖼️", key:message.key }
      });
    }

    const api =
`https://api.nexray.web.id/tools/removebg?url=${encodeURIComponent(imageUrl)}`;

    const { data } = await axios.get(api,{
      responseType:"arraybuffer"
    });

    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(data),
        caption: "✨ Background berhasil dihapus"
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
   console.error("Remove Background Error :", err?.response?.data || err.message);

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

export default {
  handle,
  Commands: ["removebg", "rmbg", "removebackground", "nobg"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};



/*
Name Fitur : remove baground
Type Code : cjs
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code uploder di bawah ini , jadi nanti hasilnya only url image saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { downloadQuotedMedia, downloadMedia } = require("../../lib/utils.js");

fs.ensureDirSync("tmp");

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
    console.error("Upload TmpFiles Error :", err?.response?.data || err.message);
    return false;
  }
}

async function handle(sock, messageInfo) {

  const {
    remoteJid,
    message,
    content,
    prefix,
    command,
    isQuoted,
    type
  } = messageInfo;

  try {

    let imageUrl;

    if (isQuoted || type === "image") {

      const mediaType = isQuoted?.type || type;

      if (mediaType !== "image") {
        return await sock.sendMessage(
          remoteJid,
          { text: "⚠️ Kirim atau reply *gambar* terlebih dahulu." },
          { quoted: message }
        );
      }

      await sock.sendMessage(remoteJid,{
        react:{ text:"🖼️", key:message.key }
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

    else {

      const url = content?.trim();

      if (!url) {
        return await sock.sendMessage(
          remoteJid,
          {
            text:
`⚠️ *Format Penggunaan :*

1️⃣ Reply gambar
*${prefix + command}*

2️⃣ Kirim URL gambar
*${prefix + command}* https://example.com/image.jpg`
          },
          { quoted: message }
        );
      }

      imageUrl = url;

      await sock.sendMessage(remoteJid,{
        react:{ text:"🖼️", key:message.key }
      });
    }

    const api =
`https://api.nexray.web.id/tools/removebg?url=${encodeURIComponent(imageUrl)}`;

    const { data } = await axios.get(api,{
      responseType:"arraybuffer"
    });

    await sock.sendMessage(
      remoteJid,
      {
        image: Buffer.from(data),
        caption: "✨ Background berhasil dihapus"
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
   console.error("Remove Background Error :", err?.response?.data || err.message);

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

module.exports = {
  handle,
  Commands: ["removebg", "rmbg", "removebackground", "nobg"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};



/*
Name Fitur : remove baground
Type Code : case
Created By : alfian
Note : jika script kalian gak support download image secara langsung , kalian bisa hapus code uploder di bawah ini , jadi nanti hasilnya only url image saja.
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "removebg":
case "rmbg":
case "removebackground":
case "nobg": {

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

fs.ensureDirSync("tmp");

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
    console.error("Upload TmpFiles Error :", err?.response?.data || err.message);
    return false;
  }
}

try {

let imageUrl;

if (m.quoted || m.mtype === "imageMessage") {

const mediaType = m.quoted?.mimetype || m.mimetype;

if (!mediaType?.includes("image")) {
return m.reply("⚠️ Kirim atau reply *gambar* terlebih dahulu.");
}

await sock.sendMessage(m.chat,{
react:{ text:"🖼️", key:m.key }
});

const fileName = m.quoted
? await downloadQuotedMedia(m)
: await downloadMedia(m);

if (!fileName) throw new Error("Gagal download media");

const filePath = path.join("tmp", fileName);

const uploadUrl = await uploadTmpfiles(filePath);

fs.unlinkSync(filePath);

if (!uploadUrl) throw new Error("Upload gambar gagal");

imageUrl = uploadUrl;

} else {

const url = text?.trim();

if (!url) {
return m.reply(
`⚠️ *Format Penggunaan :*

1️⃣ Reply gambar
*${prefix + command}*

2️⃣ Kirim URL gambar
*${prefix + command}* https://example.com/image.jpg`
);
}

imageUrl = url;

await sock.sendMessage(m.chat,{
react:{ text:"🖼️", key:m.key }
});

}

const api =
`https://api.nexray.web.id/tools/removebg?url=${encodeURIComponent(imageUrl)}`;

const { data } = await axios.get(api,{
responseType:"arraybuffer"
});

await sock.sendMessage(
m.chat,
{
image: Buffer.from(data),
caption: "✨ Background berhasil dihapus"
},
{ quoted: m }
);

await sock.sendMessage(m.chat,{
react:{ text:"✅", key:m.key }
});

} catch (err) {

console.error("Remove Background Error :", err?.response?.data || err.message);

await sock.sendMessage(m.chat,{
text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
},{ quoted: m });

await sock.sendMessage(m.chat,{
react:{ text:"❌", key:m.key }
});

}

}
break;