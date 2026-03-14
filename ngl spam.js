/*
Name Fitur : ngl spam
Type Code : esm
Created By : alfian 
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import axios from "axios";

async function handle(sock, messageInfo) {

  const { remoteJid, message, content, prefix, command } = messageInfo;

  try {

    if (!content || !content.includes("|")) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
        },
        { quoted: message }
      );
    }

    const args = content.split("|").map(v => v.trim());

    const link = args[0];
    const pesan = args[1];
    const jumlah = args[2];

    if (!link || !pesan || !jumlah) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
        },
        { quoted: message }
      );
    }

    // reaction loading
    await sock.sendMessage(remoteJid,{
      react:{ text:"🕒", key:message.key }
    });

    const api =
`https://api-faa.my.id/faa/ngl-spam?link=${encodeURIComponent(link)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`;

    const { data } = await axios.get(api);

//Kirim text
    await sock.sendMessage(
      remoteJid,
      {
        text:
`✅ *Ngl Spam Berhasil Dikirim*

🔗 Link :
${link}

💬 Pesannya :
${pesan}

📨 Jumlah Kirim :
${jumlah}`
      },
      { quoted: message }
    );

    // reaction sukses
    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {
    console.error("Ngl Spam Error :", err?.response?.data || err.message);

    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

export default {
  handle ,
  Commands:["nglspam", "spamngl"] ,
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2
};



/*
Name Fitur : ngl spam
Type Code : cjs
Created By : alfian 
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const axios = require("axios");

async function handle(sock, messageInfo) {

  const { remoteJid, message, content, prefix, command } = messageInfo;

  try {

    if (!content || !content.includes("|")) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
        },
        { quoted: message }
      );
    }

    const args = content.split("|").map(v => v.trim());

    const link = args[0];
    const pesan = args[1];
    const jumlah = args[2];

    if (!link || !pesan || !jumlah) {
      return await sock.sendMessage(
        remoteJid,
        {
          text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
        },
        { quoted: message }
      );
    }

    await sock.sendMessage(remoteJid,{
      react:{ text:"🕒", key:message.key }
    });

    const api =
`https://api-faa.my.id/faa/ngl-spam?link=${encodeURIComponent(link)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`;

    const { data } = await axios.get(api);

    await sock.sendMessage(
      remoteJid,
      {
        text:
`✅ *Ngl Spam Berhasil Dikirim*

🔗 Link :
${link}

💬 Pesannya :
${pesan}

📨 Jumlah Kirim :
${jumlah}`
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"✅", key:message.key }
    });

  } catch (err) {

    console.error("Ngl Spam Error :", err?.response?.data || err.message);

    await sock.sendMessage(
      remoteJid,
      {
        text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
      },
      { quoted: message }
    );

    await sock.sendMessage(remoteJid,{
      react:{ text:"❌", key:message.key }
    });
  }
}

module.exports = {
  handle ,
  Commands:["nglspam","spamngl"],
  OnlyPremium:false ,
  OnlyOwner:false ,
  limitDeduction:2
};



/*
Name Fitur : ngl spam
Type Code : case
Created By : alfian 
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "nglspam":
case "spamngl": {

const axios = require("axios");

try {

  if (!text || !text.includes("|")) {
    return sock.sendMessage(
      m.chat,
      {
        text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
      },
      { quoted: m }
    );
  }

  const args = text.split("|").map(v => v.trim());

  const link = args[0];
  const pesan = args[1];
  const jumlah = args[2];

  if (!link || !pesan || !jumlah) {
    return sock.sendMessage(
      m.chat,
      {
        text:
`⚠️ *Format penggunaan :*

📍 *Parameter :*
*${prefix + command}* https://ngl.link/namakamu | pesannya | jumlahnya

💬 *Contoh :*
*${prefix + command}* https://ngl.link/alfian | halo bang | 10`
      },
      { quoted: m }
    );
  }

  await sock.sendMessage(m.chat,{
    react:{ text:"🕒", key:m.key }
  });

  const api =
`https://api-faa.my.id/faa/ngl-spam?link=${encodeURIComponent(link)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`;

  const { data } = await axios.get(api);

  await sock.sendMessage(
    m.chat,
    {
      text:
`✅ *Ngl Spam Berhasil Dikirim*

🔗 Link :
${link}

💬 Pesannya :
${pesan}

📨 Jumlah Kirim :
${jumlah}`
    },
    { quoted: m }
  );

  await sock.sendMessage(m.chat,{
    react:{ text:"✅", key:m.key }
  });

} catch (err) {

  console.error("Ngl Spam Error :", err?.response?.data || err.message);

  await sock.sendMessage(
    m.chat,
    {
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.message}`
    },
    { quoted: m }
  );

  await sock.sendMessage(m.chat,{
    react:{ text:"❌", key:m.key }
  });

}

}
break;