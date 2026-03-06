/*
Name Fitur : stalk ml
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {
    const { m, remoteJid, prefix, command, content } = messageInfo;

    try {

        if (!content || !content.includes("|")) {
            return await sock.sendMessage(remoteJid, {
                text:
`⚠️ *Format Penggunaan :*

Gunakan format:
${prefix + command} id | zone

💬 Contoh:
${prefix + command} 807663005 | 12230`
            }, { quoted: m });
        }

        // reaction loading
        await sock.sendMessage(remoteJid, {
            react: { text: "🔎", key: m.key }
        });

        const [id, zone] = content.split("|").map(v => v.trim());

        const response = await axios.get(
            `https://api.nexray.web.id/stalker/mlbb?id=${id}&zone=${zone}`
        );

        const json = response.data;

        if (!json?.status || !json?.result) {
            throw new Error("Data MLBB tidak ditemukan.");
        }

        const data = json.result;

        // =========================
        // TEXT OUTPUT
        // =========================
        const text =
`╭━━━〔 𝗠𝗢𝗕𝗜𝗟𝗘 𝗟𝗘𝗚𝗘𝗡𝗗𝗦 𝗦𝗧𝗔𝗟𝗞 🎮 〕━━━⬣

👤 *Informasi Player*
• 🏷️ Username : ${data.username || "-"}
• 🆔 ID : ${data.id || "-"} | ${data.zone || "-"}
• 🌏 Region : ${data.region || "-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`;

        // =========================
        // BUTTON COPY
        // =========================
        const buttons = [];

        function add(name, value) {
            if (!value || value === "-") return;
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `Copy ${name}`,
                    copy_code: value
                })
            });
        }

        add("Username", data.username);
        add("ID", data.id);
        add("Zone", data.zone);
        add("ID Lengkap", `${data.id} | ${data.zone}`);
        add("Region", data.region);

        await sock.sendMessage(
            remoteJid,
            {
                text,
                footer: "Klik tombol dibawah untuk menyalin data",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

        // reaction sukses
        await sock.sendMessage(remoteJid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error("ML Stalk Error:", err?.response?.data || err.message);

        await sock.sendMessage(remoteJid, {
            text:
`⚠️ Terjadi kesalahan saat mengambil data MLBB.

💡 Detail Error:
${err?.response?.data?.message || err.message}`
        }, { quoted: m });

        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

export default {
    handle,
    Commands: ["mlstalk", "mlcek", "ml"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};

/*
Name Fitur : stalk ml
Type Code : esm
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {
    const { m, remoteJid, prefix, command, content } = messageInfo;

    try {

        if (!content || !content.includes("|")) {
            return await sock.sendMessage(remoteJid, {
                text:
`⚠️ *Format Penggunaan :*

Gunakan format:
${prefix + command} id | zone

💬 Contoh:
${prefix + command} 807663005 | 12230`
            }, { quoted: m });
        }

        // reaction loading
        await sock.sendMessage(remoteJid, {
            react: { text: "🔎", key: m.key }
        });

        const [id, zone] = content.split("|").map(v => v.trim());

        const response = await axios.get(
            `https://api.nexray.web.id/stalker/mlbb?id=${id}&zone=${zone}`
        );

        const json = response.data;

        if (!json?.status || !json?.result) {
            throw new Error("Data MLBB tidak ditemukan.");
        }

        const data = json.result;

        // =========================
        // TEXT OUTPUT
        // =========================
        const text =
`╭━━━〔 𝗠𝗢𝗕𝗜𝗟𝗘 𝗟𝗘𝗚𝗘𝗡𝗗𝗦 𝗦𝗧𝗔𝗟𝗞 🎮 〕━━━⬣

👤 *Informasi Player*
• 🏷️ Username : ${data.username || "-"}
• 🆔 ID : ${data.id || "-"} | ${data.zone || "-"}
• 🌏 Region : ${data.region || "-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`;

        // =========================
        // BUTTON COPY
        // =========================
        const buttons = [];

        function add(name, value) {
            if (!value || value === "-") return;
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `Copy ${name}`,
                    copy_code: value
                })
            });
        }

        add("Username", data.username);
        add("ID", data.id);
        add("Zone", data.zone);
        add("ID Lengkap", `${data.id} | ${data.zone}`);
        add("Region", data.region);

        await sock.sendMessage(
            remoteJid,
            {
                text,
                footer: "Klik tombol dibawah untuk menyalin data",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

        // reaction sukses
        await sock.sendMessage(remoteJid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error("ML Stalk Error:", err?.response?.data || err.message);

        await sock.sendMessage(remoteJid, {
            text:
`⚠️ Terjadi kesalahan saat mengambil data MLBB.

💡 Detail Error:
${err?.response?.data?.message || err.message}`
        }, { quoted: m });

        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

export default {
    handle,
    Commands: ["mlstalk", "mlcek", "ml"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};

/*
Name Fitur : stalk ml
Type Code : cjs
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");

async function handle(sock, messageInfo) {
    const { m, remoteJid, prefix, command, content } = messageInfo;

    try {

        if (!content || !content.includes("|")) {
            return await sock.sendMessage(remoteJid, {
                text:
`⚠️ *Format Penggunaan :*

Gunakan format:
${prefix + command} id | zone

💬 Contoh:
${prefix + command} 807663005 | 12230`
            }, { quoted: m });
        }

        // reaction loading
        await sock.sendMessage(remoteJid, {
            react: { text: "🔎", key: m.key }
        });

        const [id, zone] = content.split("|").map(v => v.trim());

        const response = await axios.get(
            `https://api.nexray.web.id/stalker/mlbb?id=${id}&zone=${zone}`
        );

        const json = response.data;

        if (!json?.status || !json?.result) {
            throw new Error("Data MLBB tidak ditemukan.");
        }

        const data = json.result;

        // =========================
        // TEXT OUTPUT
        // =========================
        const text =
`╭━━━〔 𝗠𝗢𝗕𝗜𝗟𝗘 𝗟𝗘𝗚𝗘𝗡𝗗𝗦 𝗦𝗧𝗔𝗟𝗞 🎮 〕━━━⬣

👤 *Informasi Player*
• 🏷️ Username : ${data.username || "-"}
• 🆔 ID : ${data.id || "-"} | ${data.zone || "-"}
• 🌏 Region : ${data.region || "-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`;

        // =========================
        // BUTTON COPY
        // =========================
        const buttons = [];

        function add(name, value) {
            if (!value || value === "-") return;
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: `Copy ${name}`,
                    copy_code: value
                })
            });
        }

        add("Username", data.username);
        add("ID", data.id);
        add("Zone", data.zone);
        add("ID Lengkap", `${data.id} | ${data.zone}`);
        add("Region", data.region);

        await sock.sendMessage(
            remoteJid,
            {
                text,
                footer: "Klik tombol dibawah untuk menyalin data",
                interactiveButtons: buttons
            },
            { quoted: m }
        );

        // reaction sukses
        await sock.sendMessage(remoteJid, {
            react: { text: "✅", key: m.key }
        });

    } catch (err) {
        console.error("ML Stalk Error:", err?.response?.data || err.message);

        await sock.sendMessage(remoteJid, {
            text:
`⚠️ Terjadi kesalahan saat mengambil data MLBB.

💡 Detail Error:
${err?.response?.data?.message || err.message}`
        }, { quoted: m });

        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

module.exports = {
    handle,
    Commands: ["mlstalk", "mlcek", "ml"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};

/*
Name Fitur : stalk ml
Type Code : case
Created By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "mlstalk":
case "mlcek":
case "ml": {
const axios = require("axios")

try {

if (!text || !text.includes("|")) {
return m.reply(
`⚠️ *Format Penggunaan :*

Gunakan format:
${prefix + command} id | zone

💬 Contoh:
${prefix + command} 807663005 | 12230`
)
}

// reaction loading
await sock.sendMessage(m.chat, {
react: { text: "🔎", key: m.key }
})

const [id, zone] = text.split("|").map(v => v.trim())

const response = await axios.get(
`https://api.nexray.web.id/stalker/mlbb?id=${id}&zone=${zone}`
)

const json = response.data

if (!json?.status || !json?.result) {
throw new Error("Data MLBB tidak ditemukan.")
}

const data = json.result

// =========================
// TEXT OUTPUT
// =========================
const result =
`╭━━━〔 𝗠𝗢𝗕𝗜𝗟𝗘 𝗟𝗘𝗚𝗘𝗡𝗗𝗦 𝗦𝗧𝗔𝗟𝗞 🎮 〕━━━⬣

👤 *Informasi Player*
• 🏷️ Username : ${data.username || "-"}
• 🆔 ID : ${data.id || "-"} | ${data.zone || "-"}
• 🌏 Region : ${data.region || "-"}

╰━━━━━━━━━━━━━━━━━━━━⬣
> *Powered By Gokufin*`

// =========================
// BUTTON COPY
// =========================
const buttons = []

function add(name, value) {
if (!value || value === "-") return
buttons.push({
name: "cta_copy",
buttonParamsJson: JSON.stringify({
display_text: `Copy ${name}`,
copy_code: value
})
})
}

add("Username", data.username)
add("ID", data.id)
add("Zone", data.zone)
add("ID Lengkap", `${data.id} | ${data.zone}`)
add("Region", data.region)

await sock.sendMessage(
m.chat,
{
text: result,
footer: "Klik tombol dibawah untuk menyalin data",
interactiveButtons: buttons
},
{ quoted: m }
)

// reaction sukses
await sock.sendMessage(m.chat, {
react: { text: "✅", key: m.key }
})

} catch (err) {
console.error("ML Stalk Error:", err?.response?.data || err.message)

await sock.sendMessage(m.chat, {
text:
`⚠️ Terjadi kesalahan saat mengambil data MLBB.

💡 Detail Error:
${err?.response?.data?.message || err.message}`
}, { quoted: m })

await sock.sendMessage(m.chat, {
react: { text: "❌", key: m.key }
})
}

}
break
