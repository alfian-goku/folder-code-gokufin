/*
 * translate.js — Google Translate Scraper (No API)
 * Cmd: .translate / .tr <lang> <teks> | reply pesan + .tr <lang>
 */

import axios from 'axios'

// ==================== CUSTOM CONFIG ====================
// Durasi auto typing (ms)
const TYPING_DURATION = 10000
// =======================================================

// Daftar User-Agent random
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
]

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const languages = {
  af: 'Afrikaans', sq: 'Albania', am: 'Amharik', ar: 'Arab',
  hy: 'Armenia', az: 'Azerbaijan', eu: 'Basque', be: 'Belarusia',
  bn: 'Bengali', bs: 'Bosnia', bg: 'Bulgaria', ca: 'Katalan',
  ceb: 'Cebuano', zh: 'Mandarin (Sederhana)', 'zh-CN': 'Mandarin (Sederhana)',
  'zh-TW': 'Mandarin (Tradisional)', co: 'Korsika', hr: 'Kroasia',
  cs: 'Ceko', da: 'Denmark', nl: 'Belanda', en: 'Inggris',
  eo: 'Esperanto', et: 'Estonia', fi: 'Finlandia', fr: 'Prancis',
  fy: 'Frisia', gl: 'Galisia', ka: 'Georgia', de: 'Jerman',
  el: 'Yunani', gu: 'Gujarati', ht: 'Kreol Haiti', ha: 'Hausa',
  haw: 'Hawaii', he: 'Ibrani', iw: 'Ibrani', hi: 'Hindi',
  hmn: 'Hmong', hu: 'Hungaria', is: 'Islandia', ig: 'Igbo',
  id: 'Indonesia', ga: 'Irlandia', it: 'Italia', ja: 'Jepang',
  jw: 'Jawa', jv: 'Jawa', kn: 'Kannada', kk: 'Kazakh',
  km: 'Khmer', rw: 'Kinyarwanda', ko: 'Korea', ku: 'Kurdi',
  ky: 'Kirgiz', lo: 'Lao', la: 'Latin', lv: 'Latvia',
  lt: 'Lithuania', lb: 'Luksemburg', mk: 'Makedonia', mg: 'Malagasi',
  ms: 'Melayu', ml: 'Malayalam', mt: 'Malta', mi: 'Maori',
  mr: 'Marathi', mn: 'Mongolia', my: 'Myanmar (Burma)', ne: 'Nepal',
  no: 'Norwegia', ny: 'Nyanja', or: 'Odia', ps: 'Pashto',
  fa: 'Persia', pl: 'Polandia', pt: 'Portugis', pa: 'Punjabi',
  ro: 'Rumania', ru: 'Rusia', sm: 'Samoa', gd: 'Gaelik Skotlandia',
  sr: 'Serbia', st: 'Sesotho', sn: 'Shona', sd: 'Sindhi',
  si: 'Sinhala', sk: 'Slovakia', sl: 'Slovenia', so: 'Somali',
  es: 'Spanyol', su: 'Sunda', sw: 'Swahili', sv: 'Swedia',
  tl: 'Tagalog', tg: 'Tajik', ta: 'Tamil', tt: 'Tatar',
  te: 'Telugu', th: 'Thailand', tr: 'Turki', tk: 'Turkmen',
  uk: 'Ukraina', ur: 'Urdu', ug: 'Uighur', uz: 'Uzbek',
  vi: 'Vietnam', cy: 'Wales', xh: 'Xhosa', yi: 'Yiddish',
  yo: 'Yoruba', zu: 'Zulu',
}

let lastRequestTime = 0

// ============ MULTI-ENDPOINT SCRAPER ============

async function tryGoogleAPIs(text, sl, tl) {
  const url = 'https://translate.googleapis.com/translate_a/single'
  const res = await axios.get(url, {
    params: { client: 'gtx', sl, tl, dt: 't', dj: '1', q: text },
    headers: {
      'User-Agent': getRandomUA(),
      Referer: 'https://translate.google.com/',
    },
    timeout: 15000,
    validateStatus: () => true,
  })
  if (res.status !== 200) throw new Error(`googleapis HTTP ${res.status}`)
  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  return parseResult(data, sl)
}

async function tryGoogleGTX(text, sl, tl) {
  const url = 'https://translate.google.com/translate_a/single'
  const res = await axios.get(url, {
    params: { client: 'gtx', sl, tl, dt: 't', dj: '1', q: text },
    headers: {
      'User-Agent': getRandomUA(),
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://translate.google.com/',
    },
    timeout: 15000,
    validateStatus: () => true,
  })
  if (res.status !== 200) throw new Error(`google.com/gtx HTTP ${res.status}`)
  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  return parseResult(data, sl)
}

async function tryChromeExt(text, sl, tl) {
  const url = 'https://clients5.google.com/translate_a/t'
  const res = await axios.get(url, {
    params: { client: 'dict-chrome-ex', sl, tl, q: text },
    headers: {
      'User-Agent': getRandomUA(),
      Accept: '*/*',
    },
    timeout: 15000,
    validateStatus: () => true,
  })
  if (res.status !== 200) throw new Error(`clients5/chrome-ex HTTP ${res.status}`)
  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  return parseResult(data, sl)
}

async function tryLegacyArray(text, sl, tl) {
  const url = 'https://translate.googleapis.com/translate_a/single'
  const res = await axios.get(url, {
    params: { client: 'gtx', sl, tl, dt: 't', q: text },
    headers: {
      'User-Agent': getRandomUA(),
      Referer: 'https://translate.google.com/',
    },
    timeout: 15000,
    responseType: 'text',
    validateStatus: () => true,
  })
  if (res.status !== 200) throw new Error(`legacy-array HTTP ${res.status}`)
  const raw = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
  const data = JSON.parse(raw)
  return parseResult(data, sl)
}

function parseResult(data, fallbackLang) {
  let translatedText = ''
  let detectedLang = fallbackLang

  if (!data) throw new Error('Response kosong dari Google')

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.sentences && Array.isArray(data.sentences)) {
      translatedText = data.sentences.filter((s) => s.trans).map((s) => s.trans).join('')
    }
    detectedLang = data.src || fallbackLang
  }

  if (!translatedText && Array.isArray(data)) {
    if (data[0] && Array.isArray(data[0])) {
      translatedText = data[0].filter((item) => item && item[0]).map((item) => item[0]).join('')
    }
    if (data[2]) detectedLang = data[2]
  }

  if (!translatedText && Array.isArray(data) && data[0] && typeof data[0] === 'object' && data[0].trans) {
    translatedText = data.map((s) => s.trans).join('')
    detectedLang = data[0]?.src || fallbackLang
  }

  if (!translatedText) throw new Error('Parser gagal extract terjemahan')

  return { text: translatedText, from: detectedLang }
}

async function googleTranslate(text, targetLang, sourceLang = 'auto') {
  const now = Date.now()
  if (now - lastRequestTime < 800) await delay(800 - (now - lastRequestTime))

  const endpoints = [
    { name: 'googleapis', fn: tryGoogleAPIs },
    { name: 'google-gtx', fn: tryGoogleGTX },
    { name: 'chrome-ext', fn: tryChromeExt },
    { name: 'legacy-array', fn: tryLegacyArray },
  ]

  const errors = []

  for (const ep of endpoints) {
    try {
      console.log(`[TRANSLATE] Trying ${ep.name}...`)
      const result = await ep.fn(text, sourceLang, targetLang)
      lastRequestTime = Date.now()
      if (result && result.text) {
        console.log(`[TRANSLATE] ✅ ${ep.name} berhasil`)
        return { text: result.text, from: result.from, to: targetLang }
      }
      errors.push(`${ep.name}: Hasil kosong`)
    } catch (err) {
      const msg = err?.response ? `HTTP ${err.response.status}: ${String(err.response.data).slice(0, 100)}` : err.message
      errors.push(`${ep.name}: ${msg}`)
      console.log(`[TRANSLATE] ❌ ${ep.name} gagal: ${msg}`)
      await delay(500)
    }
  }

  const detail = errors.join('\n')
  throw new Error(`Semua endpoint gagal:\n${detail}`)
}

// ============ GOKUFIN HANDLER ============

async function handle(sock, messageInfo) {
  const { remoteJid, message, content, isQuoted, command, prefix } = messageInfo;

  const args = content ? content.split(' ').filter(a => a) : [];
  const langCode = args[0] ? args[0].toLowerCase() : null;

  if (!langCode) {
    return await sock.sendMessage(
      remoteJid, 
      {
        text: `⚠️ Masukkan kode bahasa tujuan!\n\n` +
          `📌 *Format:*\n` +
          `${prefix}${command} <kode_bahasa> <teks>\n` +
          `${prefix}${command} <kode_bahasa> _(reply pesan)_\n\n` +
          `📝 *Contoh:*\n` +
          `${prefix}${command} en aku akan tidur\n` +
          `${prefix}${command} ar _(reply pesan orang)_\n` +
          `${prefix}${command} ja selamat pagi\n\n` +
          `🌐 *Kode Bahasa Populer:*\n` +
          `• id — Indonesia\n` +
          `• en — Inggris\n` +
          `• ar — Arab\n` +
          `• ja — Jepang\n` +
          `• ko — Korea\n` +
          `• zh — Mandarin\n` +
          `• de — Jerman\n` +
          `• fr — Prancis\n` +
          `• es — Spanyol\n` +
          `• pt — Portugis\n` +
          `• ru — Rusia\n` +
          `• hi — Hindi\n` +
          `• th — Thailand\n` +
          `• vi — Vietnam\n` +
          `• tr — Turki\n` +
          `• ms — Melayu\n` +
          `• jw — Jawa\n` +
          `• su — Sunda\n\n` +
          `Ketik *${prefix}${command} list* untuk melihat semua kode bahasa.`
      }, 
      { quoted: message }
    );
  }

  if (langCode === 'list') {
    let listText = `🌐 *Daftar Kode Bahasa Google Translate*\n\n`
    const seen = new Set()
    for (const [code, name] of Object.entries(languages)) {
      if (seen.has(name)) continue
      seen.add(name)
      listText += `• *${code}* — ${name}\n`
    }
    listText += `\n📌 Total: ${seen.size} bahasa tersedia`
    
    return await sock.sendMessage(remoteJid, { text: listText }, { quoted: message });
  }

  if (!languages[langCode]) {
    return await sock.sendMessage(
      remoteJid, 
      {
        text: `❌ Kode bahasa "*${langCode}*" tidak valid!\n\n` +
          `Ketik *${prefix}${command} list* untuk melihat semua kode bahasa yang didukung.\n\n` +
          `🌐 *Contoh kode bahasa:*\n` +
          `• id — Indonesia\n` +
          `• en — Inggris\n` +
          `• ar — Arab\n` +
          `• ja — Jepang\n` +
          `• ko — Korea`
      }, 
      { quoted: message }
    );
  }

  let textToTranslate = '';
  const remainingText = args.slice(1).join(' ').trim();

  if (remainingText) {
    textToTranslate = remainingText;
  } else if (isQuoted) {
    textToTranslate = isQuoted.text || isQuoted.caption || isQuoted.conversation || "";
    if (!textToTranslate && typeof isQuoted === "object") {
        textToTranslate = isQuoted.extendedTextMessage?.text || isQuoted.imageMessage?.caption || isQuoted.videoMessage?.caption || "";
    }
  }

  if (!textToTranslate) {
    return await sock.sendMessage(
      remoteJid, 
      {
        text: `⚠️ Tidak ada teks untuk diterjemahkan!\n\n` +
          `📌 *Cara pakai:*\n` +
          `1️⃣ *Langsung:* ${prefix}${command} ${langCode} <teks>\n` +
          `   Contoh: ${prefix}${command} ${langCode} halo apa kabar\n\n` +
          `2️⃣ *Reply pesan:* Reply pesan seseorang lalu ketik:\n` +
          `   ${prefix}${command} ${langCode}`
      }, 
      { quoted: message }
    );
  }

  await sock.sendMessage(remoteJid, { react: { text: '♻️', key: message.key } });
  
  await sock.sendPresenceUpdate('composing', remoteJid);
  const typingInterval = setInterval(() => sock.sendPresenceUpdate('composing', remoteJid), 5000);
  setTimeout(() => clearInterval(typingInterval), TYPING_DURATION);
  
  try {
    const result = await googleTranslate(textToTranslate, langCode);

    if (!result.text) {
      await sock.sendMessage(remoteJid, { react: { text: '❌', key: message.key } });
      return await sock.sendMessage(remoteJid, { text: '❌ Gagal menerjemahkan teks. Coba lagi nanti.' }, { quoted: message });
    }

    const fromLang = languages[result.from] || result.from;
    const toLang = languages[result.to] || result.to;

    const replyText =
      `🌐 *Google Translate*\n\n` +
      `> ${fromLang} (${result.from}) » ${toLang} (${result.to})\n\n` +
      `📝 *Original Text:*\n${textToTranslate}\n\n` +
      `✅ *Result:*\n${result.text}`;

    // ==========================================
    // INJEKSI DIRECT PAYLOAD (TANPA IMPORT BAILEYS)
    // ==========================================
    const interactivePayload = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: { hasMediaAttachment: false },
            body: { text: replyText },
            footer: { text: 'Google Translate' },
            nativeFlowMessage: {
              buttons: [{
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Copy Result',
                  id: 'copy',
                  copy_code: result.text
                })
              }]
            }
          }
        }
      }
    };

    // Eksekusi pengiriman payload langsung ke sock.sendMessage
    await sock.sendMessage(remoteJid, interactivePayload, { quoted: message });
    await sock.sendMessage(remoteJid, { react: { text: '✅', key: message.key } });
    
  } catch (e) {
    console.error('[TRANSLATE ERROR]', e);
    await sock.sendMessage(remoteJid, { react: { text: '❌', key: message.key } });

    const errorDetail = e.message || String(e);
    const errorMsg =
      `⚠️ *Terjadi Kesalahan pada sistem!*\n\n` +
      `💡 *Detail Error :*\n_${errorDetail}_`;

    await sock.sendMessage(remoteJid, { text: errorMsg }, { quoted: message });
  }
}

export default {
  handle,
  Commands: ["translate", "tr"],
  OnlyPremium: false,
  OnlyOwner: false,
};