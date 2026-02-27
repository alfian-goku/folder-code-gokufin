/*
Name Fitur : play ch
Type Code : esm
Base Api : nexray lagi 😅🙏 
Created By : alfian
*/

import axios from 'axios';
import { downloadToBuffer } from '../../lib/utils.js';
import fs from "fs-extra";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

async function sendMessageWithQuote(sock, remoteJid, message, text) {
    return sock.sendMessage(remoteJid, { text }, { quoted: message });
}

async function sendReaction(sock, message, reaction) {
    return sock.sendMessage(message.key.remoteJid, {
        react: { text: reaction, key: message.key }
    });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        const query = content?.trim();
        if (!query) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_\n\n_💬 Contoh:_ *${prefix + command}* Lagu Love Story`
            );
        }

        await sendReaction(sock, message, "🎧");

        //=========================
        // YT PLAY FETCH
        //=========================
        const ytRes = await axios.get(
            `https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`
        );

        const yt = ytRes.data?.result;
        if (!yt) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ Video tidak ditemukan.');
        }

        const title = yt.title?.trim();
        const channel = yt.channel?.trim();
        const thumbnail = yt.thumbnail;
        const download_url = yt.download_url;
        const seconds = yt.seconds;

        if (!title||!channel||!thumbnail||!download_url) {
            throw new Error("Data ytplay tidak lengkap.");
        }

        if (seconds > 3600) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ Video terlalu panjang.');
        }

    //=======================
    // CANVAS GENERATE (100% sinkron title)
    //=======================
        const canvasUrl =
            `https://api.nexray.web.id/canvas/youtube` +
            `?title=${encodeURIComponent(title.substring(0, 60))}` +
            `&artist=${encodeURIComponent(channel.substring(0, 40))}` +
            `&coverurl=${encodeURIComponent(thumbnail)}`;

        const canvasRes = await axios.get(canvasUrl, {
            responseType: 'arraybuffer'
        });

        const canvasBuffer = canvasRes.data;

        //=====================
        // DOWNLOAD AUDIO
        //=======================
        const rawAudio = await downloadToBuffer(download_url, 'mp3');

        const inputPath = path.join('./tmp', `${uuidv4()}.mp3`);
        const outputPath = path.join('./tmp', `${uuidv4()}.ogg`);

        await fs.writeFile(inputPath, rawAudio);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .noVideo()
                .audioCodec('libopus')
                .audioBitrate('64k')
                .audioFrequency(48000)
                .audioChannels(1)
                .format('ogg')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });

        const finalAudio = await fs.readFile(outputPath);

        //======================
        // SEND TO CHANNEL
        //=======================
        await sock.sendMessage(
            '120363405833656579@newsletter', // id chanel mu
            {
                audio: finalAudio,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: "Gokufin Play List",
                        thumbnail: canvasBuffer,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        );

        // Kirim ke chanel
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});

        // berikan reaction sukses
        await sendReaction(sock, message, "✅");

        // beritahukan si pengguna bahwa perintah sukses
        await sendMessageWithQuote(
            sock,
            remoteJid,
            message,
            '_✅ Success send channel_'
        );

    } catch (error) {
        console.error("Play Channel Error:", error?.response?.data||error.message);

  // kirim pemberitahuan error
        await sendMessageWithQuote(
            sock,
            remoteJid,
            message,
            '⚠️ Terjadi kesalahan saat memproses permintaan.'
        );
        
        // kirim reaction error 
        await sendReaction(sock, message, "❌");
    }
}

export default {
    handle,
    Commands: ["playch", "playchanel"],
    OnlyPremium: false,
    OnlyOwner: true,
    limitDeduction: 2,
};

/*
Name Fitur : play ch - play yt ke ch
Type Code : cjs
Base Api : nexray
Created By : alfian
Note : untuk code cjs sesuaikan saja sama script kalian
*/

const axios = require('axios');
const { downloadToBuffer } = require('../../lib/utils.js');
const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4 as uuidv4 } = require("uuid"); // ini sesuaikan saja

async function sendMessageWithQuote(sock, remoteJid, message, text) {
    return sock.sendMessage(remoteJid, { text }, { quoted: message });
}

async function sendReaction(sock, message, reaction) {
    return sock.sendMessage(message.key.remoteJid, {
        react: { text: reaction, key: message.key }
    });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, content, prefix, command } = messageInfo;

    try {
        const query = content?.trim();
        if (!query) {
            return sendMessageWithQuote(
                sock,
                remoteJid,
                message,
                `_⚠️ Format Penggunaan:_\n\n_💬 Contoh:_ *${prefix + command}* Lagu Love Story`
            );
        }

        await sendReaction(sock, message, "🎧");

        //=========================
        // YT PLAY FETCH
        //=========================
        const ytRes = await axios.get(
            `https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`
        );

        const yt = ytRes.data?.result;
        if (!yt) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ Video tidak ditemukan.');
        }

        const title = yt.title?.trim();
        const channel = yt.channel?.trim();
        const thumbnail = yt.thumbnail;
        const download_url = yt.download_url;
        const seconds = yt.seconds;

        if (!title||!channel||!thumbnail||!download_url) {
            throw new Error("Data ytplay tidak lengkap.");
        }

        if (seconds > 3600) {
            return sendMessageWithQuote(sock, remoteJid, message, '⛔ Video terlalu panjang.');
        }

    //=======================
    // CANVAS GENERATE (100% sinkron title)
    //=======================
        const canvasUrl =
            `https://api.nexray.web.id/canvas/youtube` +
            `?title=${encodeURIComponent(title.substring(0, 60))}` +
            `&artist=${encodeURIComponent(channel.substring(0, 40))}` +
            `&coverurl=${encodeURIComponent(thumbnail)}`;

        const canvasRes = await axios.get(canvasUrl, {
            responseType: 'arraybuffer'
        });

        const canvasBuffer = canvasRes.data;

        //=====================
        // DOWNLOAD AUDIO
        //=======================
        const rawAudio = await downloadToBuffer(download_url, 'mp3');

        const inputPath = path.join('./tmp', `${uuidv4()}.mp3`);
        const outputPath = path.join('./tmp', `${uuidv4()}.ogg`);

        await fs.writeFile(inputPath, rawAudio);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .noVideo()
                .audioCodec('libopus')
                .audioBitrate('64k')
                .audioFrequency(48000)
                .audioChannels(1)
                .format('ogg')
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });

        const finalAudio = await fs.readFile(outputPath);

        //======================
        // SEND TO CHANNEL
        //=======================
        await sock.sendMessage(
            '120363405833656579@newsletter', // id chanel mu
            {
                audio: finalAudio,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: "Gokufin Play List",
                        thumbnail: canvasBuffer,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }
        );

        // Kirim ke chanel
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});

        // berikan reaction sukses
        await sendReaction(sock, message, "✅");

        // beritahukan si pengguna bahwa perintah sukses
        await sendMessageWithQuote(
            sock,
            remoteJid,
            message,
            '_✅ Success send channel_'
        );

    } catch (error) {
        console.error("Play Channel Error:", error?.response?.data||error.message);

  // kirim pemberitahuan error
        await sendMessageWithQuote(
            sock,
            remoteJid,
            message,
            '⚠️ Terjadi kesalahan saat memproses permintaan.'
        );
        
        // kirim reaction error 
        await sendReaction(sock, message, "❌");
    }
}

module.exports = {
    handle,
    Commands: ['playch', 'playchanel'],
    OnlyPremium: false,
    OnlyOwner: true,
    limitDeduction: 2,
};
