/*
Name Fitur : Fake Saluran
Type Code : esm
Modifikasi By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

import { downloadQuotedMedia, downloadMedia, reply } from '../../lib/utils.js'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs-extra'
import sharp from 'sharp'

fs.ensureDirSync('tmp')

// uploader uguu
async function uploadToUguu(filePath) {
  try {
    const form = new FormData()
    form.append('files[]', fs.createReadStream(filePath))

    const res = await axios.post('https://uguu.se/upload', form, {
      headers: form.getHeaders(),
      timeout: 60000
    })

    return res.data?.files?.[0]?.url || null
  } catch {
    return null
  }
}

// convert media ke png
async function normalizeToPNG(inputPath) {
  const out = path.join('tmp', `norm_${Date.now()}.png`)

  await sharp(inputPath, { animated: true, pages: 1 })
    .png()
    .toFile(out)

  return out
}

// command handler
async function handle(sock, messageInfo) {

  const {
    m,
    remoteJid,
    sender,
    message,
    isQuoted,
    type,
    prefix,
    command,
    content
  } = messageInfo

  const parts = (content ?? '').split('|').map(v => v.trim())

  const name = parts[0]
  const followers = parts[1]
  const desc = parts[2]
  const date = parts[3]

  if (!name || !followers || !desc || !date) {
    return reply(m,
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* name saluran | pengikut | deskripsi <bio> | tanggal buat

💬 Contoh :
*${prefix + command}* AlfianXD | 35.607 | Welcome to Chanel | 06/04/20`
    )
  }

  let mediaTemp = null
  let pngPath = null
  let avatarUrl = null
  let resultPath = null

  try {

    await sock.sendMessage(remoteJid, { react: { text: "📢", key: message.key } })

    const mediaType = isQuoted ? isQuoted.type : type

    if (['image','sticker'].includes(mediaType)) {

      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message)

      mediaTemp = path.join('tmp', fileName)

      pngPath = await normalizeToPNG(mediaTemp)

      avatarUrl = await uploadToUguu(pngPath)
    }

    if (!avatarUrl) {
      avatarUrl = await sock.profilePictureUrl(sender, 'image')
      .catch(() => 'https://files.clugx.my.id/2OPQI.jpg')
    }

    const apiUrl =
      `https://api.zenzxz.my.id/maker/fakechannel` +
      `?url=${encodeURIComponent(avatarUrl)}` +
      `&name=${encodeURIComponent(name)}` +
      `&followers=${encodeURIComponent(followers)}` +
      `&desc=${encodeURIComponent(desc)}` +
      `&date=${encodeURIComponent(date)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 120000
    })

    resultPath = path.join('tmp', `fakech_${Date.now()}.jpg`)
    await fs.writeFile(resultPath, res.data)

    await sock.sendMessage(
      remoteJid,
      {
        image: fs.readFileSync(resultPath),
        caption:
`*Fake Saluran* 📢

👤 Nama : ${name}
👥 Followers : ${followers}
📅 Tanggal : ${date}
📝 Deskripsi : ${desc}`
      },
      { quoted: message }
    )

    await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })

  } catch (err) {
    console.error("Fake Saluran Error:", err?.response?.data || err.message)

    await sock.sendMessage(remoteJid, {
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
    }, { quoted: m })

    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: m.key }
    });
  }
}

export default {
  handle,
  Commands: ["fakech", "fakesa", "fakechanel", "fakesaluran"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};

/*
Name Fitur : Fake Saluran
Type Code : cjs
Modifikasi By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

const { downloadQuotedMedia, downloadMedia, reply } = require('../../lib/utils.js')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs-extra')
const sharp = require('sharp')

fs.ensureDirSync('tmp')

// uploader uguu
async function uploadToUguu(filePath) {
  try {
    const form = new FormData()
    form.append('files[]', fs.createReadStream(filePath))

    const res = await axios.post('https://uguu.se/upload', form, {
      headers: form.getHeaders(),
      timeout: 60000
    })

    return res.data?.files?.[0]?.url || null
  } catch {
    return null
  }
}

// convert media ke png
async function normalizeToPNG(inputPath) {
  const out = path.join('tmp', `norm_${Date.now()}.png`)

  await sharp(inputPath, { animated: true, pages: 1 })
    .png()
    .toFile(out)

  return out
}

// command handler
async function handle(sock, messageInfo) {

  const {
    m,
    remoteJid,
    sender,
    message,
    isQuoted,
    type,
    prefix,
    command,
    content
  } = messageInfo

  const parts = (content ?? '').split('|').map(v => v.trim())

  const name = parts[0]
  const followers = parts[1]
  const desc = parts[2]
  const date = parts[3]

  if (!name || !followers || !desc || !date) {
    return reply(m,
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* name saluran | pengikut | deskripsi <bio> | tanggal buat

💬 Contoh :
*${prefix + command}* AlfianXD | 35.607 | Welcome to Chanel | 06/04/20`
    )
  }

  let mediaTemp = null
  let pngPath = null
  let avatarUrl = null
  let resultPath = null

  try {

    await sock.sendMessage(remoteJid, { react: { text: "📢", key: message.key } })

    const mediaType = isQuoted ? isQuoted.type : type

    if (['image','sticker'].includes(mediaType)) {

      const fileName = isQuoted
        ? await downloadQuotedMedia(message)
        : await downloadMedia(message)

      mediaTemp = path.join('tmp', fileName)

      pngPath = await normalizeToPNG(mediaTemp)

      avatarUrl = await uploadToUguu(pngPath)
    }

    if (!avatarUrl) {
      avatarUrl = await sock.profilePictureUrl(sender, 'image')
      .catch(() => 'https://files.clugx.my.id/2OPQI.jpg')
    }

    const apiUrl =
      `https://api.zenzxz.my.id/maker/fakechannel` +
      `?url=${encodeURIComponent(avatarUrl)}` +
      `&name=${encodeURIComponent(name)}` +
      `&followers=${encodeURIComponent(followers)}` +
      `&desc=${encodeURIComponent(desc)}` +
      `&date=${encodeURIComponent(date)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 120000
    })

    resultPath = path.join('tmp', `fakech_${Date.now()}.jpg`)
    await fs.writeFile(resultPath, res.data)

    await sock.sendMessage(
      remoteJid,
      {
        image: fs.readFileSync(resultPath),
        caption:
`*Fake Saluran* 📢

👤 Nama : ${name}
👥 Followers : ${followers}
📅 Tanggal : ${date}
📝 Deskripsi : ${desc}`
      },
      { quoted: message }
    )

    await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } })

  } catch (err) {
    console.error("Fake Saluran Error:", err?.response?.data || err.message)

    await sock.sendMessage(remoteJid, {
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
    }, { quoted: m })

    await sock.sendMessage(remoteJid, {
      react: { text: "❌", key: m.key }
    });
  }
}

module.exports = {
  handle,
  Commands: ["fakech", "fakesa", "fakechanel", "fakesaluran"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1
};

/*
Name Fitur : Fake Saluran
Type Code : case
Modifikasi By : alfian
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44
*/

case "fakech":
case "fakesa":
case "fakechanel":
case "fakesaluran": {

  const parts = (text ?? '').split('|').map(v => v.trim())

  const name = parts[0]
  const followers = parts[1]
  const desc = parts[2]
  const date = parts[3]

  if (!name || !followers || !desc || !date) {
    return m.reply(
`⚠️ *Format Penggunaan :*

📍 Parameter : *${prefix + command}* name saluran | pengikut | deskripsi <bio> | tanggal buat

💬 Contoh :
*${prefix + command}* AlfianXD | 35.607 | Welcome to Chanel | 06/04/20`
    )
  }

  let mediaTemp = null
  let pngPath = null
  let avatarUrl = null
  let resultPath = null

  try {

    await sock.sendMessage(m.chat, { react: { text: "📢", key: m.key } })

    const mediaType = quoted ? quoted.mtype : m.mtype

    if (['imageMessage','stickerMessage'].includes(mediaType)) {

      const fileName = quoted
        ? await downloadQuotedMedia(m)
        : await downloadMedia(m)

      mediaTemp = path.join('tmp', fileName)

      pngPath = await normalizeToPNG(mediaTemp)

      avatarUrl = await uploadToUguu(pngPath)
    }

    if (!avatarUrl) {
      avatarUrl = await sock.profilePictureUrl(m.sender, 'image')
      .catch(() => 'https://files.clugx.my.id/2OPQI.jpg')
    }

    const apiUrl =
      `https://api.zenzxz.my.id/maker/fakechannel` +
      `?url=${encodeURIComponent(avatarUrl)}` +
      `&name=${encodeURIComponent(name)}` +
      `&followers=${encodeURIComponent(followers)}` +
      `&desc=${encodeURIComponent(desc)}` +
      `&date=${encodeURIComponent(date)}`

    const res = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      timeout: 120000
    })

    resultPath = path.join('tmp', `fakech_${Date.now()}.jpg`)
    await fs.writeFile(resultPath, res.data)

    await sock.sendMessage(
      m.chat,
      {
        image: fs.readFileSync(resultPath),
        caption:
`*Fake Saluran* 📢

👤 Nama : ${name}
👥 Followers : ${followers}
📅 Tanggal : ${date}
📝 Deskripsi : ${desc}`
      },
      { quoted: m }
    )

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (err) {

    await sock.sendMessage(m.chat, {
      text:
`⚠️ Maaf , terjadi kesalahan saat memproses permintaan anda.

💡 Detail Error :
${err?.response?.data?.message || err.message}`
    }, { quoted: m })

    await sock.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })
  }

}
break;