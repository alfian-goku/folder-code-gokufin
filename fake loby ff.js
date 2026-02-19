/*
Nama fitur : fake loby ff
Type code : cjs
base api : api.deline.web.id
created by : alfian
*/

const axios = require("axios");

async function handle(sock, messageInfo) {
  const { remoteJid, message, prefix, command, content } = messageInfo;

  try {
    const text = content.trim();
    if (!text) {
      return await sock.sendMessage(
        remoteJid,
        {
          text: `⚠️ *Format Penggunaan:*
💬 Ketik :
${prefix + command} nickname
📌 Contoh:
${prefix + command} alfian`,
        },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid, {
      react: { text: "🌀", key: message.key },
    });

      // Memanggil api
    const apiUrl =
      `https://api.deline.web.id/maker/lobbyffmax` +
      `?text=${encodeURIComponent(text)}`;

    // kirim hasil gambar
    await sock.sendMessage(
      remoteJid,
      {
        image: { url: apiUrl },
        caption: `🔥 *Lobby Free Fire MAX*\n\n🎮 *Nickname :* ${text}`,
      },
      { quoted: message }
    );

    // reaction selesai
    await sock.sendMessage(remoteJid, {
      react: { text: "✅", key: message.key },
    });
      
  } catch (err) {
    console.error("fake loby ff error:", err?.response?.data || err.message);

      // Kirim text ke user bahwa eror
    await sock.sendMessage(
      remoteJid,
      { text: "Terjadi kesalahan saat membuat Loby Free Fire MAX." },
      { quoted: message }
    );
      
      // Beri reaction eror
      await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: message.key },
    });
  }
}

module.exports = {
  handle,
  Commands: ["lobyff", "lobyffmax", "ffloby"],
  OnlyPremium: false,
  OnlyOwner: false,
};
