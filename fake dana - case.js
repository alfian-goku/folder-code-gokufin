/*
Name Fitur : Fake Dana
Type Code : case
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "fakedana":
case "dana":
case "fdana": {
  try {

    // cek format penggunaan
    if (!text) {
      return m.reply(
`⚠️ *Format Penggunaan :*

💬 Contoh :
${prefix + command} 5.000`
      );
    }

    // reaction loading
    await sock.sendMessage(m.chat, {
      react: { text: "💳", key: m.key }
    });

    const nominal = text.trim();

    // endpoint api
    const url = `https://api.zenzxz.my.id/maker/fakedanav2?nominal=${encodeURIComponent(nominal)}`;

    // kirim hasil image
    await sock.sendMessage(m.chat, {
      image: { url },
      caption:
`*Fake dana berhasil dibuat* ✅

*Nominal :* ${nominal}
> *Powered By Gokufin*`
    }, { quoted: m });

    // reaction sukses
    await sock.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });

  } catch (err) {
    console.error("FakeDana Error:", err?.response?.data || err.message);

    await sock.sendMessage(m.chat, {
      text:
`⚠️ Maaf , terjadi kesalahan saat membuat Fake Dana.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
    }, { quoted: m });

    // reaction error
    await sock.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    });
  }
}
break
