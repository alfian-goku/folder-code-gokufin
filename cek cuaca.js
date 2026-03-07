/* =========================
   ESM VERSION
========================= */
/*
Name Fitur : Cek Cuaca
Type Code : esm
Created By : alfian
Channel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import nexray from 'api-nexray'
import { getBuffer } from '../../lib/utils.js'

async function handle(sock, messageInfo) {
    const { m, remoteJid, message, prefix, command, content } = messageInfo;

    try {
        if (!content.trim()) {
            return await sock.sendMessage(remoteJid, { text: `_⚠️ Format Penggunaan :_ \n\n_💬 Contoh : *${prefix + command}* Makassar` }, { quoted: message });
        }

        await sock.sendMessage(remoteJid, { react: { text: "🔎", key: message.key } });

        const response = await nexray.get('/information/cuaca', {
            kota: content
        });

        const { location: { desa, kecamatan, provinsi }, forecasts } = response.result;

        const suhuArray = forecasts.map(f => parseInt(f.suhu.replace('°C', '')));
        const temp = (suhuArray.reduce((a, b) => a + b, 0) / suhuArray.length).toFixed(1);
        const temp_min = Math.min(...suhuArray);
        const temp_max = Math.max(...suhuArray);
        const kecepatan_angin = forecasts[0]?.kecepatan_angin;

        let teks = `✧  *C U A C A*\n\n` +
        `    ◦  *Desa* : ${desa}\n` +
        `    ◦  *Kecamatan* : ${kecamatan}\n` +
        `    ◦  *Provinsi* : ${provinsi}\n` +
        `    ◦  *Rata-rata Suhu* : ${temp} °C\n` +
        `    ◦  *Minimal* : ${temp_min} °C\n` +
        `    ◦  *Maksimal* : ${temp_max} °C\n` +
        `    ◦  *Kecepatan Angin* : ${kecepatan_angin}\n\n` +
        `    ✧  *P R A K I R A A N*\n\n`;

        forecasts.forEach(forecast => {
            const jam = forecast.waktu.split(':')[0];
            teks += `    ◦  *Jam* : ${jam}:00\n` +
                    `    ◦  *Cuaca* : ${forecast.cuaca}\n` +
                    `    ◦  *Suhu* : ${forecast.suhu}\n` +
                    `    ◦  *Kelembaban* : ${forecast.kelembaban}\n` +
                    `    ◦  *Angin* : ${forecast.kecepatan_angin}\n` +
                    `    ◦  *Arah Angin* : ${forecast.arah_angin}\n` +
                    `    ◦  *Visibilitas* : ${forecast.visibilitas}\n\n`;
        });

        teks += `> *Powered By Gokufin MD*`;

        const buffer = await getBuffer(forecasts[0].image_url);

        await sock.sendMessage(remoteJid, { 
            text: teks,
            contextInfo: {
                externalAdReply: {
                    title: "© Gokufin MD V5.0.1",
                    thumbnail: buffer,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

        await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });

    } catch (err) {

        console.error("Cek Cuaca Error:", err?.response?.data || err.message);

        await sock.sendMessage(remoteJid, {
            text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
        }, { quoted: m });

        await sock.sendMessage(remoteJid, {
            react: { text: "❌", key: m.key }
        });
    }
}

export default {
    handle,
    Commands: ["cuaca", "cekcuaca"],
    OnlyPremium: false,
    OnlyOwner: false,
};



/* =========================
   CJS VERSION
========================= */
/*
Name Fitur : Cek Cuaca
Type Code : cjs
Created By : alfian
Channel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const nexray = require('api-nexray')
const { getBuffer } = require('../../lib/utils.js')

async function handle(sock, messageInfo) {
    const { m, remoteJid, message, prefix, command, content } = messageInfo;

    try {

        if (!content.trim()) {
            return await sock.sendMessage(remoteJid,{ text:`_⚠️ Format Penggunaan :_\n\n_💬 Contoh : *${prefix+command}* Makassar` },{ quoted: message })
        }

        await sock.sendMessage(remoteJid,{ react:{ text:"🔎", key:message.key } })

        const response = await nexray.get('/information/cuaca',{ kota: content })

        const { location:{ desa,kecamatan,provinsi }, forecasts } = response.result

        const suhuArray = forecasts.map(f => parseInt(f.suhu.replace('°C','')))
        const temp = (suhuArray.reduce((a,b)=>a+b,0) / suhuArray.length).toFixed(1)
        const temp_min = Math.min(...suhuArray)
        const temp_max = Math.max(...suhuArray)
        const kecepatan_angin = forecasts[0]?.kecepatan_angin

        let teks = `✧  *C U A C A*\n\n`

        teks += `    ◦  *Desa* : ${desa}\n`
        teks += `    ◦  *Kecamatan* : ${kecamatan}\n`
        teks += `    ◦  *Provinsi* : ${provinsi}\n`
        teks += `    ◦  *Rata-rata Suhu* : ${temp} °C\n`
        teks += `    ◦  *Minimal* : ${temp_min} °C\n`
        teks += `    ◦  *Maksimal* : ${temp_max} °C\n`
        teks += `    ◦  *Kecepatan Angin* : ${kecepatan_angin}\n\n`
        teks += `    ✧  *P R A K I R A A N*\n\n`

        forecasts.forEach(f => {
            const jam = f.waktu.split(':')[0]

            teks += `    ◦  *Jam* : ${jam}:00\n`
            teks += `    ◦  *Cuaca* : ${f.cuaca}\n`
            teks += `    ◦  *Suhu* : ${f.suhu}\n`
            teks += `    ◦  *Kelembaban* : ${f.kelembaban}\n`
            teks += `    ◦  *Angin* : ${f.kecepatan_angin}\n`
            teks += `    ◦  *Arah Angin* : ${f.arah_angin}\n`
            teks += `    ◦  *Visibilitas* : ${f.visibilitas}\n\n`
        })

        teks += `> *Powered By Gokufin MD*`

        const buffer = await getBuffer(forecasts[0].image_url)

        await sock.sendMessage(remoteJid,{
            text:teks,
            contextInfo:{
                externalAdReply:{
                    title:"© Gokufin MD V5.0.1",
                    thumbnail:buffer,
                    mediaType:1,
                    renderLargerThumbnail:true
                }
            }
        },{ quoted: message })

        await sock.sendMessage(remoteJid,{ react:{ text:"✅", key:message.key } })

    } catch(err){

        console.error("Cek Cuaca Error:", err?.response?.data || err.message)

        await sock.sendMessage(remoteJid,{
            text:`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.`
        },{ quoted: m })

        await sock.sendMessage(remoteJid,{ react:{ text:"❌", key:m.key }})
    }
}

module.exports = {
    handle,
    Commands:["cuaca","cekcuaca"],
    OnlyPremium:false,
    OnlyOwner:false
}



/* =========================
   CASE VERSION
========================= */
/*
Name Fitur : Cek Cuaca
Type Code : case
Created By : alfian
Channel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "cuaca":
case "cekcuaca": {

if (!text) return reply(`_⚠️ Format Penggunaan :_\n\n_💬 Contoh : *${prefix+command}* Makassar`)

await sock.sendMessage(m.chat,{ react:{ text:"🔎", key:m.key }})

try {

const response = await nexray.get('/information/cuaca',{ kota:text })

const { location:{ desa,kecamatan,provinsi }, forecasts } = response.result

const suhuArray = forecasts.map(f => parseInt(f.suhu.replace('°C','')))
const temp = (suhuArray.reduce((a,b)=>a+b,0) / suhuArray.length).toFixed(1)
const temp_min = Math.min(...suhuArray)
const temp_max = Math.max(...suhuArray)
const kecepatan_angin = forecasts[0]?.kecepatan_angin

let teks = `✧  *C U A C A*\n\n`

teks += `    ◦  *Desa* : ${desa}\n`
teks += `    ◦  *Kecamatan* : ${kecamatan}\n`
teks += `    ◦  *Provinsi* : ${provinsi}\n`
teks += `    ◦  *Rata-rata Suhu* : ${temp} °C\n`
teks += `    ◦  *Minimal* : ${temp_min} °C\n`
teks += `    ◦  *Maksimal* : ${temp_max} °C\n`
teks += `    ◦  *Kecepatan Angin* : ${kecepatan_angin}\n\n`
teks += `    ✧  *P R A K I R A A N*\n\n`

forecasts.forEach(f => {
const jam = f.waktu.split(':')[0]

teks += `    ◦  *Jam* : ${jam}:00\n`
teks += `    ◦  *Cuaca* : ${f.cuaca}\n`
teks += `    ◦  *Suhu* : ${f.suhu}\n`
teks += `    ◦  *Kelembaban* : ${f.kelembaban}\n`
teks += `    ◦  *Angin* : ${f.kecepatan_angin}\n`
teks += `    ◦  *Arah Angin* : ${f.arah_angin}\n`
teks += `    ◦  *Visibilitas* : ${f.visibilitas}\n\n`
})

teks += `> *Powered By Gokufin MD*`

const buffer = await getBuffer(forecasts[0].image_url)

await sock.sendMessage(m.chat,{
text:teks,
contextInfo:{
externalAdReply:{
title:"© Gokufin MD V5.0.1",
thumbnail:buffer,
mediaType:1,
renderLargerThumbnail:true
}}
},{ quoted:m })

await sock.sendMessage(m.chat,{ react:{ text:"✅", key:m.key }})

} catch(err){

await sock.sendMessage(m.chat,{
text:`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.`
},{ quoted:m })

await sock.sendMessage(m.chat,{ react:{ text:"❌", key:m.key }})

}

}
break;
