/*
Name Fitur : Fake Dana
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {
  const { m, remoteJid, prefix, command, content } = messageInfo;

  try {

    // cek format penggunaan
    if (!content) {
      return await sock.sendMessage(remoteJid, {
        text:
`⚠️ *Format Penggunaan :*

💬 Contoh :
${prefix + command} 5.000`
      }, { quoted: m });
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "💳", key: m.key }
    });

    const nominal = content.trim();

    // endpoint api
    const url = `https://api.zenzxz.my.id/maker/fakedanav2?nominal=${encodeURIComponent(nominal)}`;

    // kirim hasil image
    await sock.sendMessage(remoteJid, {
      image: { url },
      caption:
`*Fake dana berhasil dibuat* ✅

*Nominal :* ${nominal}
> *Powered By Gokufin*`
    }, { quoted: m });

    // reaction sukses
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("FakeDana Error:", err?.response?.data || err.message);

    // kirim pesan error
    await sock.sendMessage(remoteJid, {
      text:
`⚠️ Maaf , terjadi kesalahan saat membuat Fake Dana.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
    }, { quoted: m });

    // reaction error
    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: m.key }
    });
  }
}

export default {
  handle,
  Commands: ["fakedana", "dana", "fdana"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};
