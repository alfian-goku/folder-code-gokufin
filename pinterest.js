/*
Name Fitur : pinterest search dan download
Created By : alfian
Date : 14 - 10 - 2026
Base Url : https://id.pinterest.com
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44 || https://whatsapp.com/channel/0029Vb7IByEKwqSXJw1aX11c
*/

import axios from "axios";

const MAX_RESULTS = 1; // Ubah jika ingin mengirim lebih dari 1 media sekaligus

async function fetchPinterestCookies() {
    try {
        const response = await axios.get('https://id.pinterest.com/', {
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.9,id;q=0.8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
                'upgrade-insecure-requests': '1'
            }
        });

        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders && setCookieHeaders.length > 0) {
            const cookiesStr = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
            
            let bid = '';
            setCookieHeaders.forEach(c => {
                if (c.includes('_b=')) {
                    bid = c.split('_b=')[1].split(';')[0].replace(/"/g, ''); 
                }
            });

            return { cookiesStr, bid };
        }
        throw new Error("Tidak ada cookie yang dikembalikan oleh server Pinterest.");
    } catch (error) {
        throw new Error(`Gagal mengambil session cookie Pinterest: ${error.message}`);
    }
}

async function handle(sock, messageInfo) {
    const { remoteJid, alfianxd, message, content, command: rawCommand } = messageInfo;
    const command = rawCommand.toLowerCase();

    try {
        const args = content ? content.trim().split(" ") : [];

        // ==========================================
        // 1. FITUR PINTEREST SEARCH (.pin)
        // ==========================================
        if (command === "pin" || command === "pinterest") {
            const queryRaw = args.join(" ");

            if (!queryRaw) {
                return await sock.sendMessage(
                    remoteJid, 
                    { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ *${command}* Kucing` }, 
                    { quoted: message }
                );
            }

            await sock.sendMessage(remoteJid, { react: { text: "🔍", key: message.key } });

            const pinSession = await fetchPinterestCookies();
            const sourceUrl = `/search/pins/?q=${encodeURIComponent(queryRaw)}&rs=typed`;

            const dataPayload = {
                "options": {
                    "query": queryRaw,
                    "scope": "pins",
                    "appliedProductFilters": "---",
                    "domains": null,
                    "user": null,
                    "seoDrawerEnabled": false,
                    "applied_unified_filters": null,
                    "auto_correction_disabled": false,
                    "filter_genai": false,
                    "journey_depth": null,
                    "source_id": null,
                    "source_module_id": null,
                    "source_url": sourceUrl,
                    "static_feed": false,
                    "selected_one_bar_modules": null,
                    "query_pin_sigs": null,
                    "page_size": 25,
                    "gated": true,
                    "price_max": null,
                    "price_min": null,
                    "query_image_pins": null,
                    "request_params": null,
                    "top_pin_ids": null,
                    "article": null,
                    "corpus": null,
                    "filters": null,
                    "rs": "typed"
                },
                "context": {}
            };

            const targetUrl = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=${encodeURIComponent(sourceUrl)}&data=${encodeURIComponent(JSON.stringify(dataPayload))}&_=${Date.now()}`;

            const headers = {
                'accept': 'application/json, text/javascript, */*, q=0.01',
                'accept-language': 'en-US,en;q=0.9,id;q=0.8',
                'cookie': pinSession.cookiesStr,
                'referer': 'https://id.pinterest.com/',
                'sec-ch-ua': '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
                'x-pinterest-appstate': 'active',
                'x-pinterest-platform-bid': pinSession.bid, 
                'x-pinterest-pws-handler': 'www/search/[scope].js',
                'x-pinterest-source-url': sourceUrl,
                'x-requested-with': 'XMLHttpRequest'
            };

            const response = await axios.get(targetUrl, { headers });
            const results = response.data?.resource_response?.data?.results;

            if (!results || results.length === 0) {
                await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
                return await sock.sendMessage(remoteJid, { text: `❌ Tidak ditemukan hasil untuk: *${queryRaw}*` }, { quoted: message });
            }

            let validMedia = [];
            for (let pin of results) {
                if (pin.videos && pin.videos.video_list && pin.videos.video_list.V_720P) {
                    validMedia.push({ type: 'video', url: pin.videos.video_list.V_720P.url });
                } else if (pin.images && pin.images.orig) {
                    validMedia.push({ type: 'image', url: pin.images.orig.url });
                }
            }

            if (validMedia.length === 0) {
                await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
                return await sock.sendMessage(remoteJid, { text: `❌ Media tidak ditemukan atau format dilindungi.` }, { quoted: message });
            }

            validMedia.sort(() => Math.random() - 0.5);
            const mediaToSend = validMedia.slice(0, MAX_RESULTS);
            const sendPromises = mediaToSend.map(async (media, idx) => {
                try {
                    const bufferRes = await axios.get(media.url, { responseType: 'arraybuffer' });
                    const mediaBuffer = bufferRes.data;
                    
                    // Caption hanya diberikan pada gambar/video PERTAMA (Index 0)
                    let captionText = undefined;
                    if (idx === 0) {
                        captionText = media.type === 'video' ? `🎥 *Pinterest Video*` : `🖼️ *Pinterest Image*`;
                    }

                    if (media.type === 'video') {
                        return sock.sendMessage(remoteJid, { video: mediaBuffer, caption: captionText }, { quoted: message });
                    } else {
                        return sock.sendMessage(remoteJid, { image: mediaBuffer, caption: captionText }, { quoted: message });
                    }
                } catch (dlError) {
                    console.error("Gagal download media:", dlError.message);
                    return null;
                }
            });

            await Promise.all(sendPromises);
            await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
        }

        // 2. FITUR PINTEREST DOWNLOADER (.pindl)
        else if (command === "pindl" || command === "pinterestdl") {
            const url = args[0];

            if (!url || !url.match(/pin\.it|pinterest\.com/i)) {
                return await sock.sendMessage(
                    remoteJid,
                    { text: `_⚠️ Format Penggunaan:_ \n\n_💬 Contoh:_ *${command}* https://pin.it/Abcd321` },
                    { quoted: message }
                );
            }

            await sock.sendMessage(remoteJid, { react: { text: "🔍", key: message.key } });

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'
            };

            const response = await axios.get(url, { headers });
            const html = response.data;

            // Pencarian URL Media via Regex
            const videoRegex = /"url"\s*:\s*"(https:[^"]+\.mp4)"/i;
            const videoMatch = html.match(videoRegex);

            const imgOrigRegex = /"url"\s*:\s*"(https:[^"]+originals[^"]+\.(?:jpg|png|jpeg))"/i;
            const imgOrigMatch = html.match(imgOrigRegex);

            const img736Regex = /"(https:[^"]+736x[^"]+\.(?:jpg|png|jpeg))"/i;
            const img736Match = html.match(img736Regex);

            let mediaUrl = "";
            let mediaType = "";

            if (videoMatch && videoMatch[1]) {
                mediaUrl = videoMatch[1];
                mediaType = "video";
            } else if (imgOrigMatch && imgOrigMatch[1]) {
                mediaUrl = imgOrigMatch[1];
                mediaType = "image";
            } else if (img736Match && img736Match[1]) {
                mediaUrl = img736Match[1];
                mediaType = "image";
            } else {
                throw new Error("Gagal menemukan link media. Konten mungkin diprivate atau dihapus.");
            }

            // Bersihkan escape character (\/)
            mediaUrl = mediaUrl.replace(/\\/g, '');

            // Download Buffer
            const mediaRes = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            const mediaBuffer = mediaRes.data;

            // Kirim ke WhatsApp
            if (mediaType === "video") {
                await sock.sendMessage(
                    remoteJid,
                    { video: mediaBuffer, caption: `🎥 *Pinterest Video*` },
                    { quoted: message }
                );
            } else {
                await sock.sendMessage(
                    remoteJid,
                    { image: mediaBuffer, caption: `🖼️ *Pinterest Image*` },
                    { quoted: message }
                );
            }

            await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });
        }

    } catch (err) {
        console.error("pinterest error :", err?.response?.data || err.message);

        await sock.sendMessage(
            remoteJid, {
                text: `⚠️ _Maaf , Terjadi kesalahan saat memproses permintaan anda. Silahkan coba lagi nanti_\n\n💡 Detail Error :\n${err?.message}`
            },
            { quoted: message }
        );

        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: message.key }
        });
    }
}

export default {
    handle,
    Commands: ["pin", "pinterest", "pindl", "pinterestdl"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};