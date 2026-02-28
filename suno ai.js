/*
Name Fitur : suno ai
Type Code : esm
Base Api : api.nexray.web.id
Modifikasi By : alfian
tutor install module : ada di loby awal api.nexray.web.id
Note : untuk bagian import api-nexray itu bisa di ganti dengan axios tapi kalau mau ganti bagian importx jgn lupa pemanggilan untuk apinya juga di ganti
*/

import nexray from 'api-nexray';
import { downloadToBuffer, getBuffer } from '../../lib/utils.js';
import { logCustom } from "../../lib/logger.js";

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    // costum text tampilan format penggunaannya
    try {
        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `⚠️ _Format Penggunaan :_ \n\n 💬 Contoh : *_${prefix + command}_* lagu love story` }, { quoted: message });
        }
    
        // beru reaction Loading
        await sock.sendMessage(remoteJid, { react: { text: "🎧", key: message.key } });

  // Inisialisasi api simple jika memakai module api nexray
        const response = await nexray.get("/ai/suno", {
           prompt: content  
            });
        const { title, tags, duration, thumbnail, url, lyrics } = response.result; 

        // Kirim informasi vidio / lirik
        const caption = `✧  *S U N O*\n\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Duration* : ${duration}\n` + 
`    ◦  *Tags* : ${tags}\n\n` + 
`${lyrics}\n` + `undifined\n` + "> *Powered By Gokufin*";
              
              const buffer = await getBuffer(thumbnail);
        
        
        // Kirim image / thumbnail vidio atau lirik
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: "© " + "Gokufin " + "V " + global.version,
                 thumbnail: buffer,
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(url, 'mp3');

            // Kirim audio file
            await sock.sendMessage(
                remoteJid,
                {
                    audio: audioBuffer,
                    fileName: `elrayyxml.mp3`,
                    mimetype: 'audio/mp4',
                },
                { quoted: message }
            );
   
        // Sukses
        await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
        
    // code untuk paraf kedua dan komplit letak eror!
    } catch (err) {
    console.error("Error while handle suno ai", err?.response?.data||err.message);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

  // kirim text eror beserta code yang eror ke pengguna
        const errorMessage = `⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n💡 Detail Eror : ${error.message||error}`;
        await sock.sendMessage(remoteJid, { text: errorMessage 
                                           }, { quoted: message });
        
        // beri reaction Loading
        await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
    }
}

export default {
    handle,
    Commands    : ["suno", "aisuno", "sunoai"],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction : 2, // Jumlah limit yang akan dikurangi
};

/*
Name Fitur : suno ai
Type Code : cjs
Base Api : api.nexray.web.id
Modifikasi By : alfian
tutor install module : ada di loby awal api.nexray.web.id
Note : untuk bagian import api-nexray itu bisa di ganti dengan axios tapi kalau mau ganti bagian importx jgn lupa pemanggilan untuk apinya juga di ganti
*/

const nexray = require("api-nexray");
const { downloadToBuffer, getBuffer  } = require("../../lib/utils");
const { logCustom  } = require("../../lib/logger");

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    // costum text tampilan format penggunaannya
    try {
        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `⚠️ _Format Penggunaan :_ \n\n 💬 Contoh : *_${prefix + command}_* lagu love story` }, { quoted: message });
        }
    
        // beru reaction Loading
        await sock.sendMessage(remoteJid, { react: { text: "🎧", key: message.key } });

  // Inisialisasi api simple jika memakai module api nexray
        const response = await nexray.get("/ai/suno", {
           prompt: content  
            });
        const { title, tags, duration, thumbnail, url, lyrics } = response.result; 

        // Kirim informasi vidio / lirik
        const caption = `✧  *S U N O*\n\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Duration* : ${duration}\n` + 
`    ◦  *Tags* : ${tags}\n\n` + 
`${lyrics}\n` + `undifined\n` + "> *Powered By Gokufin*";
              
              const buffer = await getBuffer(thumbnail);
        
        
        // Kirim image / thumbnail vidio atau lirik
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: "© " + "Gokufin " + "V " + global.version,
                 thumbnail: buffer,
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(url, 'mp3');

            // Kirim audio file
            await sock.sendMessage(
                remoteJid,
                {
                    audio: audioBuffer,
                    fileName: `elrayyxml.mp3`,
                    mimetype: 'audio/mp4',
                },
                { quoted: message }
            );
   
        // Sukses
        await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
        
    // code untuk paraf kedua dan komplit letak eror!
    } catch (err) {
    console.error("Error while handle suno ai", err?.response?.data||err.message);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

  // kirim text eror beserta code yang eror ke pengguna
        const errorMessage = `⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n💡 Detail Eror : ${error.message||error}`;
        await sock.sendMessage(remoteJid, { text: errorMessage 
                                           }, { quoted: message });
        
        // beri reaction Loading
        await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
    }
}

module.exports = {
    handle,
    Commands    : ["suno", "aisuno", "sunoai"],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction : 2, // Jumlah limit yang akan dikurangi
};
