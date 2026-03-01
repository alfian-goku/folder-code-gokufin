/*
Name Fitur : free fire cek info profil
Type Code : esm
Base Api : nexray
Created By : alfian
*/

import axios from "axios";

// ==========================
// 📅 FORMAT TANGGAL AKUN DIBUAT
// ==========================
function formatTanggal(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
}
    
async function handle(sock, messageInfo) {
    const { m, remoteJid, prefix, command, content } = messageInfo;

    try {

        if (!content) {
            return await sock.sendMessage(remoteJid, {
                text:
                    `⚠️ *Format Penggunaan :*\n\n` + `💬 Contoh : *${prefix + command}* 12345678`
            }, { quoted: m });
        }

        // 🔎 reaction loading
        await sock.sendMessage(remoteJid, {
            react: { text: "🔎", key: m.key }
        });

        const uid = content.trim();

      // panggil api ke nexray
        const response = await axios.get(
            `https://api.nexray.web.id/stalker/freefire?uid=${uid}`
        );

        const json = response.data;

        if (!json?.status||!json?.result) {
            throw new Error("Data tidak ditemukan.");
        }

        const data = json.result;

       //==========================
       // TEXT TAMPILAN
       //==========================
        const text =
`╭━━━〔 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 𝗣𝗘𝗡𝗖𝗔𝗥𝗜𝗔𝗡 - 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘 🎮 〕━━━⬣

👤 *Informasi Profil*
• 🏷️ Nickname : ${data.name||"-"}
• 🆔 ID : ${data.uid||"-"}
• 🎖️ Level : ${data.level||"-"}
• ❤️ Like : ${data.likes||"-"}
• 🚻 Gender : ${data.gender||"-"}
• 🌏 Region : ${data.region||"-"}
• 📅 Akun Dibuat : ${formatTanggal(data.created_at)}
• ✍️ Bio : ${data.signature||"-"}

🏰 *Informasi Guild*
• 🏷️ Nama Guild : ${data.guild_name||"-"}
• 🆔 ID Guild : ${data.guild_id||"-"}
• 🎚️ Level Guild : ${data.guild_level||"-"}
• 👥 Member : ${data.guild_member||"-"}/${data.guild_capacity||"-"}
• 👑 ID Owner : ${data.guild_owner_id||"-"}
• 👤 Nick Owner : ${data.guild_leader_name||"-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`;

   // =============================
   // COPY BUTTON SIMPLE JIKA BANYAK
   //=============================
        const buttons = [];

        function add(name, value) {
            if (!value||value === "-") return;
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `Copy ${name}`,
                    copy_code: value
                })
            });
        }

        add("Nickname", data.name);
        add("ID", data.uid);
        add("Bio", data.signature);
        add("Nama Guild", data.guild_name);
        add("ID Guild", data.guild_id);
        add("ID Owner Guild", data.guild_owner_id);
        add("Nick Owner Guild", data.guild_leader_name);

        await sock.sendMessage(
            remoteJid,
            {
                text,
                footer: "Silakan klik dibawah untuk menyalin secara instan",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

        // reaction sukses
        await sock.sendMessage(remoteJid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error("FreeFire Cek Error:", err?.response?.data||err.message);

       // Kirim text eror ke pengguna
        await sock.sendMessage(remoteJid, {
            text:
                `⚠️ Maaf , terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n` +
                `💡 Detail Eror : ${err?.response?.data?.message||err.message}`
        }, { quoted: m });

      // beri reaction eror
        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

export default {
    handle,
    Commands: ["freefirecek", "ffcek", "ff"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};

/================================================

/*
Name Fitur : free fire cek info profil
Type Code : cjs
Base Api : nexray
Created By : alfian
*/

const axios = require("axios");

// ==========================
// 📅 FORMAT TANGGAL AKUN DIBUAT
// ==========================
function formatTanggal(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
}
    
async function handle(sock, messageInfo) {
    const { m, remoteJid, prefix, command, content } = messageInfo;

    try {

        if (!content) {
            return await sock.sendMessage(remoteJid, {
                text:
                    `⚠️ *Format Penggunaan :*\n\n` + `💬 Contoh : *${prefix + command}* 12345678`
            }, { quoted: m });
        }

        // 🔎 reaction loading
        await sock.sendMessage(remoteJid, {
            react: { text: "🔎", key: m.key }
        });

        const uid = content.trim();

      // panggil api ke nexray
        const response = await axios.get(
            `https://api.nexray.web.id/stalker/freefire?uid=${uid}`
        );

        const json = response.data;

        if (!json?.status||!json?.result) {
            throw new Error("Data tidak ditemukan.");
        }

        const data = json.result;

       //==========================
       // TEXT TAMPILAN
       //==========================
        const text =
`╭━━━〔 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 𝗣𝗘𝗡𝗖𝗔𝗥𝗜𝗔𝗡 - 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘 🎮 〕━━━⬣

👤 *Informasi Profil*
• 🏷️ Nickname : ${data.name||"-"}
• 🆔 ID : ${data.uid||"-"}
• 🎖️ Level : ${data.level||"-"}
• ❤️ Like : ${data.likes||"-"}
• 🚻 Gender : ${data.gender||"-"}
• 🌏 Region : ${data.region||"-"}
• 📅 Akun Dibuat : ${formatTanggal(data.created_at)}
• ✍️ Bio : ${data.signature||"-"}

🏰 *Informasi Guild*
• 🏷️ Nama Guild : ${data.guild_name||"-"}
• 🆔 ID Guild : ${data.guild_id||"-"}
• 🎚️ Level Guild : ${data.guild_level||"-"}
• 👥 Member : ${data.guild_member||"-"}/${data.guild_capacity||"-"}
• 👑 ID Owner : ${data.guild_owner_id||"-"}
• 👤 Nick Owner : ${data.guild_leader_name||"-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`;

   // =============================
   // COPY BUTTON SIMPLE JIKA BANYAK
   //=============================
        const buttons = [];

        function add(name, value) {
            if (!value||value === "-") return;
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `Copy ${name}`,
                    copy_code: value
                })
            });
        }

        add("Nickname", data.name);
        add("ID", data.uid);
        add("Bio", data.signature);
        add("Nama Guild", data.guild_name);
        add("ID Guild", data.guild_id);
        add("ID Owner Guild", data.guild_owner_id);
        add("Nick Owner Guild", data.guild_leader_name);

        await sock.sendMessage(
            remoteJid,
            {
                text,
                footer: "Silakan klik dibawah untuk menyalin secara instan",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

        // reaction sukses
        await sock.sendMessage(remoteJid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error("FreeFire Cek Error:", err?.response?.data||err.message);

       // Kirim text eror ke pengguna
        await sock.sendMessage(remoteJid, {
            text:
                `⚠️ Maaf , terjadi kesalahan saat memproses permintaan Anda. Mohon coba lagi nanti.\n\n` +
                `💡 Detail Eror : ${err?.response?.data?.message||err.message}`
        }, { quoted: m });

      // beri reaction eror
        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

module.exports = {
    handle,
    Commands: ["freefirecek", "ffcek", "ff"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};
