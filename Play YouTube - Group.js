/*
Name Fitur : play YouTube
Type Code : esm
Base Api : nexray
Created By : alfian
Note : untuk code cjs dan esm sesuaikan aja dengan struktur script kalian dan jangan lupa untuk install module api nexraynya
tutor install module : masuk kepanel>klik startup>cari command run>ubah yg awalnya npm start jadi> npm install api-nexray
*/

import nexray from 'api-nexray';
import { style, downloadToBuffer } from '../../lib/utils.js';
import config from '../../config.js';
import { logCustom } from "../../lib/logger.js";

// Fungsi untuk mengirim pesan dengan kutipan (quote)
async function sendMessageWithQuote(sock, remoteJid, message, text) {
    return sock.sendMessage(remoteJid, { text }, { quoted: message });
}

// Fungsi untuk mengirim reaksi
async function sendReaction(sock, message, reaction) {
    return sock.sendMessage(message.key.remoteJid, { react: { text: reaction, key: message.key } });
}

// Fungsi utama untuk menangani perintah
async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        const query = content.trim();
        if (!query) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} matahariku*_`
            );
        }

        // Tampilkan reaksi "Loading"
        await sendReaction(sock, message, "🎧");

                // Inisialisasi API dan unduh file
        const response = await nexray.get("/downloader/ytplay", {
           q: content  
            });
        const { title, description, channel, channel_url, duration, seconds, views, upload_at, thumbnail, url, download_url } = response.result;
        
        if (!download_url) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ _Tidak dapat menemukan video yang sesuai_');
        }

        if (seconds > 3600) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                '_Maaf, video terlalu besar untuk dikirim melalui WhatsApp._'
            );
        }

        // Kirim informasi video
        const caption = `✧  *Y T - P L A Y*\n\n` + 
`    ◦  *Channel* : ${channel}\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Description* : ${description}\n` +
`    ◦  *Duration* : ${duration} (${seconds})\n` + 
`    ◦  *Uploaded* : ${upload_at}\n` + 
`    ◦  *Views* : ${views}\n` + 
`    ◦  *Channel Url* : ${channel_url}\n` +
`    ◦  *Source* : ${url}\n\n` + 
`${config.footer}`;
    
        // Tampilkan reaksi "Sukses"
        await sendReaction(sock, message, "✅");
    
        const buffer = await nexray.getBuffer("/canvas/youtube", {
           title: title,
           artist: channel,
           coverurl: thumbnail
            });
        
            // Kirim image 
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: '© ' + 'Gokufin ' + ' v' + global.version,
                 thumbnail: buffer,
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(download_url, 'mp3');

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

    } catch (error) {
        console.error("Error while handling command:", error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

        // informasi ke pengguna bahwa error
        const errorMessage = `⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n💡 Detail: ${error.message||error}`;
        await sendMessageWithQuote(sock, remoteJid, message, errorMessage);

// Tampilkan reaksi "Eror"
        await sendReaction(sock, message, "❌");
    }
}

export default {
    handle,
    Commands    : ['play', 'playaudio', 'playgb'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction: 2, // Jumlah limit yang akan dikurangi
};

/*
Name Fitur : play yt - gb
Type Code : cjs
Base Api : nexray
Created By : alfian
Note : untuk code cjs dan esm sesuaikan aja dengan struktur script kalian dan jangan lupa untuk install module api nexraynya
tutor install module : masuk kepanel>klik startup>cari command run>ubah yg awalnya npm start jadi> npm install api-nexray
*/


const nexray = require('api-nexray');
const { style, downloadToBuffer } = require('../../lib/utils.js');
consy config = require('../../config.js');
const { logCustom } = require("../../lib/logger.js)";

// Fungsi untuk mengirim pesan dengan kutipan (quote)
async function sendMessageWithQuote(sock, remoteJid, message, text) {
    return sock.sendMessage(remoteJid, { text }, { quoted: message });
}

// Fungsi untuk mengirim reaksi
async function sendReaction(sock, message, reaction) {
    return sock.sendMessage(message.key.remoteJid, { react: { text: reaction, key: message.key } });
}

// Fungsi utama untuk menangani perintah
async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        const query = content.trim();
        if (!query) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ _*${prefix + command} matahariku*_`
            );
        }

        // Tampilkan reaksi "Loading"
        await sendReaction(sock, message, "🎧");

                // Inisialisasi API dan unduh file
        const response = await nexray.get("/downloader/ytplay", {
           q: content  
            });
        const { title, description, channel, channel_url, duration, seconds, views, upload_at, thumbnail, url, download_url } = response.result;
        
        if (!download_url) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ _Tidak dapat menemukan video yang sesuai_');
        }

        if (seconds > 3600) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                '_Maaf, video terlalu besar untuk dikirim melalui WhatsApp._'
            );
        }

        // Kirim informasi video
        const caption = `✧  *Y T - P L A Y*\n\n` + 
`    ◦  *Channel* : ${channel}\n` + 
`    ◦  *Title* : ${title}\n` + 
`    ◦  *Description* : ${description}\n` +
`    ◦  *Duration* : ${duration} (${seconds})\n` + 
`    ◦  *Uploaded* : ${upload_at}\n` + 
`    ◦  *Views* : ${views}\n` + 
`    ◦  *Channel Url* : ${channel_url}\n` +
`    ◦  *Source* : ${url}\n\n` + 
`${config.footer}`;
    
        // Tampilkan reaksi "Sukses"
        await sendReaction(sock, message, "✅");
    
        const buffer = await nexray.getBuffer("/canvas/youtube", {
           title: title,
           artist: channel,
           coverurl: thumbnail
            });
        
            // Kirim image 
            await sock.sendMessage(
    remoteJid,
    {
        text: caption,
        contextInfo: {
             externalAdReply: {
                 title: '© ' + 'Gokufin ' + ' v' + global.version,
                 thumbnail: buffer,
                 mediaType: 1,
                 renderLargerThumbnail: true 
             }
           }
    }, { quoted: message }
            );
           
           const audioBuffer = await downloadToBuffer(download_url, 'mp3');

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

    } catch (error) {
        console.error("Error while handling command:", error);
        logCustom('info', content, `ERROR-COMMAND-${command}.txt`);

        // informasi ke pengguna bahwa error
        const errorMessage = `⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n💡 Detail: ${error.message||error}`;
        await sendMessageWithQuote(sock, remoteJid, message, errorMessage);

// Tampilkan reaksi "Eror"
        await sendReaction(sock, message, "❌");
    }
}

// Bagian export atau code dibawah ini ubah seperti struktur script kalian , seperti pun dengan type code esm
module.exports = {
    handle,
    Commands    : ['play', 'playaudio', 'playgb'],
    OnlyPremium : false,
    OnlyOwner   : false,
    limitDeduction: 2, // Jumlah limit yang akan dikurangi
};
