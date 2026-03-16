/*
Name Fitur : fake group android | Tema android
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
Nama Group |  member  |  deskripsi group   |  tanggal buat group

💬 *Contoh 1 :*
*${prefix + command}* alfian  |  800  |  Welcome |  1/2/3

💬 *Contoh 2 :*
*${prefix + command}* https://example.pom/abcd.jpg  |  alfian  |  800  | Welcome  |  1/2/3`
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
    const urlMatch = text.match(/https?:\/\/\S+/);

    if (urlMatch) {

      imageUrl = urlMatch[0];
      text = text.replace(imageUrl, "").trim();
    }

    const args = text.split("|").map(v => v.trim());

    if (args.length < 4) {

      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :* 
Nama Group |  member  |  deskripsi group   |  tanggal buat group

💬 *Contoh 1 :*
*${prefix + command}* alfian |  800 |  Welcome  |  1/2/3

💬 *Contoh 2 :*
*${prefix + command}* https://example.pom/abcd.jpg  |  alfian  |  800  | Welcome  |  1/2/3`
        },
        { quoted: message }
      );
    }

    const name = args[0];
    const members = args[1];
    const desc = args[2];
    const date = args[3];

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
 // JIKA TANPA KIRIM & REPLY MEDIA PAKAI FOTO PROFIL USER
 //=====================
    if (!imageUrl) {

      try {
        imageUrl = await sock.profilePictureUrl(sender,"image");

      } catch {
        imageUrl = "https://i.ibb.co/bjpkpXhm/image-1773651795677.jpg"; // fallback jika profil user tidak ada
      }
    }

    //=====================
    // REQUEST API
    //=====================
    const api =
`https://kazztzyy.my.id/api/maker/fakegroup?image=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(name)}&members=${encodeURIComponent(members)}&desc=${encodeURIComponent(desc)}&date=${encodeURIComponent(date)}`;

      // Kirim hasil request
    await sock.sendMessage(
      remoteJid,
      {
        image:{ url: api },
        caption:"*Fake Group Android berhasil dibuat* ✅\n> *Powered By Gokufin*"
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
console.error("Fake Group Android Error :", err?.response?.data||err.message);

      // Kirim text eror
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

      // Beri reaction eror
    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

export default {
  handle ,
  Commands:["fakegroup", "fakegroupandroid", "fgandroid", "fga"] ,
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2 ,
};