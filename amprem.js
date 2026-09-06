/*
Name Fitur : amprem & amver
Type Code : esm only
Created By : alfian
Note : Don't delete credit!
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44 || https://whatsapp.com/channel/0029Vb7IByEKwqSXJw1aX11c
*/

import axios from "axios";

async function handle(sock, messageInfo) {
  const { remoteJid, message, content, command, alfian, prefix } = messageInfo;

  // Pisahkan argumen berdasarkan spasi
  const args = content ? content.trim().split(" ").filter(a => a) : [];

  // URL Target dan Headers sama untuk kedua aksi
  const targetUrl = 'https://anita-putri-official.netlify.app/.netlify/functions/amprem';
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8',
    'content-type': 'application/json',
    'origin': 'https://alight-motionn.netlify.app',
    'priority': 'u=1, i',
    'referer': 'https://alight-motionn.netlify.app/',
    'sec-ch-ua': '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'
  };

  try {
    // ============================================
    // COMMAND 1: AMPREM (Send Magic Link)
    // ============================================
    if (command === "amprem") {
      if (args.length < 1) {
        return await sock.sendMessage(
          remoteJid,
          { text: `⚠️ *Format salah!*\n\nPenggunaan:\n*${prefix + command}* <email>\n\nContoh:\n*${prefix + command}* admin@gmail.com` },
          { quoted: message }
        );
      }

      const email = args[0];
      await sock.sendMessage(remoteJid, { react: { text: "⏳", key: message.key } });

      const payload = {
        action: "send-magiclink",
        email: email
      };

      const response = await axios.post(targetUrl, payload, { headers });

      // Format Hasil
      let replyText = `✅ *Berhasil Kirim Magic Link*\n\n`;
      replyText += `📧 *Email:* ${email}\n`;

      await sock.sendMessage(remoteJid, { text: replyText }, { quoted: message });
      await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
    }

    // ============================================
    // COMMAND 2: AMVER (Verify Account)
    // ============================================
    else if (command === "amver") {
      if (args.length < 2) {
        return await sock.sendMessage(
          remoteJid,
          { text: `⚠️ *Format salah!*\n\nPenggunaan:\n*${prefix + command}* <email> <rawLink>\n\nContoh:\n*${prefix + command}* admin@gmail.com https://link.verifikasi.com/...` },
          { quoted: message }
        );
      }

      const email = args[0];
      // Jika link panjang dan terpotong spasi, satukan kembali
      const rawLink = args.slice(1).join(""); 
      
      await sock.sendMessage(remoteJid, { react: { text: "⏳", key: message.key } });

      const payload = {
        action: "verify-account",
        email: email,
        rawLink: rawLink
      };

      const response = await axios.post(targetUrl, payload, { headers });

      // Format Hasil
      let replyText = `✅ *Berhasil Request Verifikasi*\n\n`;
      replyText += `📧 *Email:* ${email}\n`;
      replyText += `🔗 *Link:* ${rawLink}\n`;

      await sock.sendMessage(remoteJid, { text: replyText }, { quoted: message });
      await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
    }

  } catch (err) {
    const errData = err?.response?.data;
    console.error(`Error pada ${command}:`, errData || err.message);
    
    await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
    await sock.sendMessage(
      remoteJid,
      { text: `⚠️ *Terjadi Kesalahan*\n\nDetail Error: ${errData ? JSON.stringify(errData) : err.message}` },
      { quoted: message }
    );
  }
}

export default {
  handle,
  Commands: ["amprem", "amver"], // Dua command dalam satu file
  OnlyPremium: false, // Sesuaikan true/false menurut seleramu
  OnlyOwner: false
};