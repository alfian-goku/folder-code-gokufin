/*
Name Fitur : Roblox Stalk
Type Code : only esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {

  const { remoteJid, message, content, prefix, command } = messageInfo;

  try {
    if (!content) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* username

💬 *Contoh :*
*${prefix + command}* VitoFromID`
        },
        { quoted: message }
      );
    }

    const username = content.trim();

    // reaction loading
    await sock.sendMessage(remoteJid,{
      react:{ text:"🕒", key:message.key }
    });

    const api =
`https://api.nexray.web.id/stalker/roblox?username=${encodeURIComponent(username)}`;

    const { data } = await axios.get(api);

    if (!data.status) throw new Error("User tidak ditemukan");

    const res = data.result.basic;

    // ===== FORMAT TANGGAL =====
    const date = new Date(res.created);
    const created =
`${date.getDate()} - ${date.getMonth()+1} - ${date.getFullYear()}`;

    const teks =
`🎮 *ROBLOX STALKER*

👤 *Username :* ${res.name}
🏷️ *Nickname :* ${res.displayName}
🆔 *User ID :* ${res.id}
📅 *Akun Dibuat :*
${created}
🚫 *Banned :* ${res.isBanned ? "Ya" : "Tidak"}
✅ *Verified :* ${res.hasVerifiedBadge ? "Ya" : "Tidak"}
📝 *Bio :*
${res.description||"Tidak ada"}`;

    await sock.sendMessage(
      remoteJid,
      { text: teks },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid,{
    react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Roblox Stalker Error :", err?.response?.data||err.message);

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

    // reaction eror
    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

export default {
  handle ,
  Commands:["roblox", "robloxstalk", "stalroblox"] ,
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2
};