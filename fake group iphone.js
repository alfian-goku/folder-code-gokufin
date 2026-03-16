/*
Name Fitur : fake group iphone | Tema iphone
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js";

fs.mkdirSync("tmp", { recursive: true });

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

    url = url.replace("tmpfiles.org/", "tmpfiles.org/dl/");

    return url;

  } catch (err) {
    console.error("Upload Tmpfiles Error :", err?.response?.data||err.message);
    return false;
  }
}

async function handle(sock, messageInfo) {

  const { remoteJid, message, content, isQuoted, prefix, command, sender, type } = messageInfo;

  try {
    if (!content) {

      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :* 
Nama Group |  jumlah member

💬 *Contoh 1 :*
*${prefix + command}* alfian  |  800

💬 *Contoh 2 :*
*${prefix + command}* https://example.pom/abcd.jpg  |  alfian  |  800`
        },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid,{
      react:{ text:"🕒", key:message.key }
    });

    let imageUrl = null;
    let text = content.trim();

    //=====================
    // CEK URL IMAGE DIAWAL
    //=====================
    const urlMatch = text.match(/https?:\/\/[^\s|]+/);

    if (urlMatch) {

      imageUrl = urlMatch[0];
      text = text.replace(imageUrl, "").trim();
    }

    const args = text.split("|").map(v => v.trim());

    if (args.length < 2) {

      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :* 
Nama Group |  jumlah member

💬 *Contoh 1 :*
*${prefix + command}* alfian  |  800

💬 *Contoh 2 :*
*${prefix + command}* https://example.pom/abcd.jpg  |  alfian  |  800`
        },
        { quoted: message }
      );
    }

    const name = args[0];
    const members = args[1];

    //=====================
    // JIKA REPLY IMAGE
    //=====================
    if (!imageUrl && isQuoted?.type === "image") {

      const fileName = await downloadQuotedMedia(message);
      const filePath = path.join("tmp", fileName);

      imageUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);
    }

    //=====================
    // JIKA KIRIM IMAGE
    //=====================
    if (!imageUrl && type === "image") {

      const fileName = await downloadMedia(message);
      const filePath = path.join("tmp", fileName);

      imageUrl = await uploadTmpfiles(filePath);

      fs.unlinkSync(filePath);
    }

    //=====================
    // JIKA TANPA MEDIA PAKAI FOTO PROFIL
    //=====================
    if (!imageUrl) {

      try {
        imageUrl = await sock.profilePictureUrl(sender,"image");

      } catch {
        imageUrl = "https://i.ibb.co/bjpkpXhm/image-1773651795677.jpg"; // Fallback ke url jika user tidak ada profil
      }
    }

    //=====================
    // REQUEST API
    //=====================
    const api =
`https://kazztzyy.my.id/api/maker/fakegroup2?image=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(name)}&members=${encodeURIComponent(members)}`;

    // Kirim hasil
    await sock.sendMessage(
      remoteJid,
      {
        image:{ url: api },
        caption:"*Fake Group iPhone berhasil dibuat* ✅\n> *Powered By Gokufin*"
      },
      { quoted: message }
    );

 // Kirim reaction sukses
    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Fake Group iPhone Error :", err?.response?.data||err.message);

    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda. Coba lagi nanti

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
  Commands:["fakegroupios", "fakegroupiphone", "fgios", "fgi"] ,
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2 ,
};