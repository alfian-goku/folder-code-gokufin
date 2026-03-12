/*
Name Fitur : capcut search
Type Code : only esm
Modifikasi By : alfian
Note : disini bisa pakai axios dengan catatan ubah juga di pemanggilan api-nya
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import nexray from 'api-nexray'; // bisa axios
import { logCustom } from "../../lib/logger.js";

async function sendMessageWithQuote(sock, remoteJid, message, text) {
    await sock.sendMessage(remoteJid, { text }, { quoted: message });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        // Validasi input: pastikan konten ada
        if (!content.trim()||content.trim() == '') {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `⚠️ *Format Penggunaan :* \n\n_💬 Contoh:_ *${prefix + command}* Cinematic`
            );
        }

        // Tampilkan reaksi "Loading"
        await sock.sendMessage(remoteJid, { react: { text: "🔎", key: message.key } });

        // Memanggil API untuk mendapatkan data video TikTok
        const response = await nexray.get('/search/capcut', {
            q: content
            });
        
        const results = response.result;
        const random = results[Math.floor(Math.random() * results.length)];
        
        const { id, title, taken_at, duration, data, bitrate, definition,  video_quality, stats: { fragment, usage, play, likes, favorite, comment }, author: { name, bio, level, score } } = random;
        
const elrayyxml = `✧  *C C - S E A R C H*\n\n` +
`    ◦  *ID* : ${id}\n` +
`    ◦  *Author* : ${name}\n` +
`    ◦  *Duration* : ${duration}\n` +
`    ◦  *Bitrate* : ${bitrate}\n` +
`    ◦  *Definition* : ${definition}\n` +
`    ◦  *Quality* : ${video_quality}\n` +
`    ◦  *Fragment* : ${fragment}\n` +
`    ◦  *Likes* : ${likes}\n` +
`    ◦  *Comment* : ${comment}\n` +
`    ◦  *Usage* : ${usage}\n` +
`    ◦  *Play* : ${play}\n` +
`    ◦  *Favorite* : ${favorite}\n` +
`    ◦  *Posted At* : ${taken_at}\n\n` +
`✧  *C A P T I O N*\n\n` +
`${title}`;
        
        // Mengirim video tanpa watermark dan caption
        await sock.sendMessage(remoteJid, {
        video: { url: data },
        caption: elrayyxml
        }, { quoted: message });
      
 // React sukses
await sock.sendMessage(remoteJid,{
    react:{ text:"✅", key:message.key }
  });
  
        } catch (err) {
    console.error("Capcut Search Error:", err?.response?.data||err.message);

  //Kirim text eror ke pengguna
await sock.sendMessage(remoteJid,{
    text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda. Mohon coba lagi beberapa saat!

💡 Detail Error :
${err?.message}`
  },{ quoted: message });

 // Reaction eror
await sock.sendMessage(remoteJid,{
    react:{ text:"❌", key:message.key }
  });
    }
}

export default {
    handle,
    Commands    : ["capcutsearch", "ccsearch", "ccs"],
    OnlyPremium : false, 
    OnlyOwner   : false,
    limitDeduction  : 2,
};