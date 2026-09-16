import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js";

fs.ensureDirSync("tmp");

const GT_TEXT_ENDPOINT =
  "https://translate.google.com/u/1/_/TranslateWebserverUi/data/batchexecute?rpcids=MkEWBc";

const GT_IMAGE_ENDPOINT =
  "https://translate.google.com/u/1/_/TranslateWebserverUi/data/batchexecute?rpcids=WqWDPb&source-path=%2Fu%2F1%2F&f.sid=2370240967266685528&bl=boq_translate-webserver_20260825.05_p0&hl=id&pageId=none&soc-app=1&soc-platform=1&soc-device=1&_reqid=361668&rt=c";

const COOKIE_IMAGE =
  "SEARCH_SAMESITE=CgQI46AB; __Secure-BUCKET=COQH; HSID=AN9yftzxxyKNZnfr9; SSID=AztJAUlAHH-nuCJet; APISID=M8FEvBj9O3W9ZzG5/AtV2ZJaLIYXrN8KRf; SAPISID=r_-w-iFqnuVKMU7e/AKdFKLZMhAozRkGav; __Secure-1PAPISID=r_-w-iFqnuVKMU7e/AKdFKLZMhAozRkGav; __Secure-3PAPISID=r_-w-iFqnuVKMU7e/AKdFKLZMhAozRkGav; SID=g.a000BAlUVDQx_NQVuzmWKYSSzKJ_7iWpYjBsFdKS10kEMR1sn1c-sAmTD7827I0qpKTlHGo0jgACgYKAZ8SARQSFQHGX2Mi5iR5FNnyJb-GVixD90jcbBoVAUF8yKrWcQO2MEGp0TmXwF_BYsia0076; __Secure-1PSID=g.a000BAlUVDQx_NQVuzmWKYSSzKJ_7iWpYjBsFdKS10kEMR1sn1c-a5A0QkOc0NQzu9VwvcbwxwACgYKAXISARQSFQHGX2MiOTfIInP6_wTStJ-Up-dYPxoVAUF8yKo93m9jzyTajWFVpKB-PDHE0076; __Secure-3PSID=g.a000BAlUVDQx_NQVuzmWKYSSzKJ_7iWpYjBsFdKS10kEMR1sn1c-dMLSXj39U-UOdxn7FwFw7wACgYKAb8SARQSFQHGX2Mi43KicgRkPIN0Klpjqe6oIBoVAUF8yKo9z4BSFKh4ZGyBriHTYCFL0076; OTZ=8757173_24_24__24_; AEC=AdJVEauHQHJCVAbE-SBkBKDd-zJ_-gd0OBVrP-uKqTGsHpnzUCssgHb8tmw; __Secure-1PSIDTS=sidts-CjcBXMw41fjG56pRdhe5qPbQqdHqDf_ffoOebb420-JjKi1cDi7Wx9KrJM70UsdSwIfcusqgDeuTEAA; __Secure-1PSIDRTS=sidts-CjcBXMw41fjG56pRdhe5qPbQqdHqDf_ffoOebb420-JjKi1cDi7Wx9KrJM70UsdSwIfcusqgDeuTEAA; __Secure-3PSIDTS=sidts-CjcBXMw41fjG56pRdhe5qPbQqdHqDf_ffoOebb420-JjKi1cDi7Wx9KrJM70UsdSwIfcusqgDeuTEAA; __Secure-3PSIDRTS=sidts-CjcBXMw41fjG56pRdhe5qPbQqdHqDf_ffoOebb420-JjKi1cDi7Wx9KrJM70UsdSwIfcusqgDeuTEAA; NID=534=NS4-2v4_1C-OAd0SXyV97I12eIvC9Lnhh2iwcPfdHeZJL4MmXDUHGYBDYtqHP_GPQPOfyWuAdokhxMn8SDZNV3QMJlhXSKChspP7rGV123q2lAxeJE5uc32jXwtV2gt1M7jUwbTB9ojRYUColy3-PUL9XgndmfBj2tbjSh7xx8ekSGKinOqU1vvhy-P8cMShwY1wcfRItsDYt7lfQJx_zLd5VtaVwU-I0EepvxBs1wsxoSczTfVvlwuR39KhwZA5TnNJU4UMgy9YndcuxiUkdObf1AuqT5x4GsBSk-x5P2CHwKsONYek8lrsI6Q76017cUZoDevzb9LlIdoptrRMaizPEQrWATK1zlBVaR4Ead27Fz7e9YOKOroJMeehxOlf_rTxs7QFkMmLHxOEY393kQS6KJKG3r13vj0wKLbcY1GcIPwzyirtj7TrtUdGbtVng0PCq_Qz6hfb3MiBJkxY6fatN4QfoQ2AHex9ljzCIzGPdzpkCwAbhjogNq8MaZoj96VeUxdF_cjdWejuSMOuVAZZwf-s_RxXGNKMvw825e0HrhIXleUhAPggxK16uqVZx5mHhI08fXIa0-hriAY3JFO26KYtvaJ-SyiDJLRuO7sPJeeEYey0V_O7SeOucz37_tBUo0rOhUttKn7UyZZdRII5tJkPxuz3zuuT9DIgpA0GEzNlXVNOZhLlzlsDSZxGD86U4pdMuSN8tuupaeSDHfyH3R_mXpKffCbG3Uta2fMfsqzxVdCxwsfSYcrohVgci0A4OFxMwORlRsSpnedULzV8UNMrL587B1T-0ZDwvVsnhNmXhFB73jIBpDAc4e28fHNdG3-LKedWrr7ImiAkXIUl8GrlOyCSnvpcfgAv0njTZNvw8zMWri1JlEInmCTfiBztqMsXkfeGhNxRp0qUTmNi-oJKcyv0WagNrvKYLKtcokEghP6wrpTnhBKJARQvaurKMcO4RrO_IqsmTFEkFzGqEWNf-Y3ruwDEceGLUq9AC7dXgzVstGcgM30iaIq77WUizE269TihDQOpvNynOTc; __Secure-STRP=ANmZwa1xqPDEud4A4Ca_kLE34XU0u0bMUSDwdC4G3IUYm0V--SfYMYzlZKfXCxnDT4QdfnM_yjP-01i3kdDE7R541ktHXht8LA; SIDCC=AKEyXzXgm8t2jME2rNJtdFvEgdVEtHdM57FrS_oif4r8hqL2EWD6px6h-ybPdNkGHPEPMwy1j1w; __Secure-1PSIDCC=AKEyXzUdyEFlT9V7Y5sqZoJ_43uJX_mgPq30HDKhPw5fAKZGd6ILQejyz27SSPjBcazU6Yr3og; __Secure-3PSIDCC=AKEyXzUVgIp7KVlAXl7qmLjBYnDgJSTO9zK9uw3eiVwEFWZT0a3LhaNonTpACmYNAulyVuJcx4Y";

const HEADERS_TEXT = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept: "*/*",
  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  Origin: "https://translate.google.com",
  Referer: "https://translate.google.com/",
  "X-Same-Domain": "1",
  "sec-ch-ua": '"Not=A?Brand";v="99", "Brave";v="151", "Chromium";v="151"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-gpc": "1",
};

const HEADERS_IMAGE = {
  Accept: "*/*",
  "Accept-Language": "id-ID,id;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  Cookie: COOKIE_IMAGE,
  Origin: "https://translate.google.com",
  Referer: "https://translate.google.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "priority": "u=1, i",
  "sec-ch-ua": '"Not=A?Brand";v="99", "Brave";v="151", "Chromium";v="151"',
  "sec-ch-ua-arch": '"x86"',
  "sec-ch-ua-bitness": '"64"',
  "sec-ch-ua-full-version-list": '"Not=A?Brand";v="99.0.0.0", "Brave";v="151.0.0.0", "Chromium";v="151.0.0.0"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-model": '""',
  "sec-ch-ua-platform": '"Windows"',
  "sec-ch-ua-platform-version": '"19.0.0"',
  "sec-ch-ua-wow64": "?0",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-gpc": "1",
  "x-goog-batchexecute-bgr": '[";YH64fhrQAAZiQFHRQkBf6nc7A3E-7CwmAEABEArZ1LaroJM4DQ_G-wtDHxdaBG1dsVf8H_JNZoUNK6SolGApQQlYGlKIe0VsEVma4ChMrc2LrzFxCCztHoI_HwAAAIJPAAAAEnUBB2MARlO6aQNZo_QInZWSyqFBiRYavENno1pQDFrYsPexBQUd7zPEUqrG3qDGw75q-pmlsX3xwf3QUp-EkMyFrt52edeYlx5rpsmEA1fVD3B4jTBwJHmG1hSnMjACTFLSNktuuGr4gr7x3qqdOo1-GgQUVoDeAKsg-sa5Zdv2hs-c2-OB8guEL2P9HMebcyw7g1WzjSI6-UyUmkMXUPF9eGEQik5lD_LKb4eMZKakuVng0Zxgii6up01pJIsHaK5Dnf0rcvTyHOLoY3rQ-LErt8y_Tb6mITJkUQuEvJ5R5AppT-RFgbrYPhVymE478YCkw2q2BVPpM-zl18w5oKqaAZWlM0Nsd-iEJVx3D---rQV0XZrGSmq0e64ba71vnYmA4WpAEN-wR-uOjC4sGmMNErxde-vIEq4kIYCtDawA060FK0b5uL4Nlo4ctVI7KFQs82PG8ohh8lPJLM6lWtd7rvlHf81FZROzMvrX0v3aikb0Z5igXj0WCWXeQI-lMG9JS9k1QcWqtIWYnej4vqeVbnjd-l6dBrwL5DpOGrMPqWOZ8KBQERyhzGMptjARkFL9h0LxlOl0g4FBEV1D3u3gzwAm_Zd-pjqdw8ErWpIjmcNA-nI83t7p24jlGqlcjSDBFZ7_-xYea_pYMHqpPC-aZIzixuyzv5pRz9M5M0Vpjy-lIt1nhZdj3Y73S4vO-oqdf8r6PGFLISqQku1LYSttoeAjXsFsfylhZ8chzpdCxWPuQ3CrUY4fTliUD4bV5upKGG9FSvMau3UUm7aKcSHjHkorHB9ghWmYxo15FaOGEYvA46PvCDr89PgYcD11aXV9IzvhFaB9NpmR4QuxDXJI-wyrEQUTCaKOwK1iJNx5huzJRoDZjrMwbKhPUmYmymttnaP7yWDk117aRZrNtb4s0bMqybAuH--Ml7mPWXlzz2OKxqxW_fn5f25PwxOBdzX9JyFC-4QH5jdV4M3UPFretPcl9m6Z4wd8b-3PxjF43vtupa6bRDbwMqdx7BCyirSGn7tqDtWXZC19joN2a1HniqnHCONx2GZsZ9m1hWWQQepVD5DgaM0818g7iUm8Fr0lxeMEoPG6VTL43kksBEOj0nRnqcixcUIy5dteEjCTQ07j_kJiwzk577BlMWa4JQ58iDr_0Mw_W_s1HQwkaWKjBhRfm_SyQBjAQDEmYBA24FsIxJfuLJZfRJ6tLPM__aY1omyOw11b5ssqZjjGsjJD7kfNA6s",null,null,340,8,null,null,0,"2"]',
  "x-goog-ext-387202953-jspb": '["/DataService.GetImageTranslation"]',
  "x-same-domain": "1",
};

const LANG_LIST = {
  id: "Indonesia", en: "Inggris", ja: "Jepang", ko: "Korea",
  zh: "Mandarin", ar: "Arab", fr: "Prancis", de: "Jerman",
  es: "Spanyol", pt: "Portugis", ru: "Rusia", th: "Thailand",
  vi: "Vietnam", ms: "Melayu", tl: "Filipina", hi: "Hindi",
  tr: "Turki", it: "Italia", nl: "Belanda", sv: "Swedia",
};

function getLangName(code) {
  return LANG_LIST[code] || code.toUpperCase();
}

function detectMime(buf) {
  const hex = buf.slice(0, 4).toString("hex");
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (hex.startsWith("52494646")) return "image/webp";
  return "image/jpeg";
}

function parseArgs(content = "") {
  const trimmed = content.trim();
  if (!trimmed) return { targetLang: "id", text: "" };
  const parts = trimmed.split(/\s+/);
  const maybeCode = parts[0];
  if (/^[a-z]{2}(-[a-zA-Z]{2,4})?$/.test(maybeCode) && maybeCode.length <= 7 && parts.length > 1) {
    return { targetLang: maybeCode, text: parts.slice(1).join(" ") };
  }
  return { targetLang: "id", text: trimmed };
}

function extractTextResult(parsed) {
  const innerRaw = parsed?.[0]?.[2];
  if (!innerRaw) throw new Error("Google tidak mengembalikan hasil terjemahan");
  const inner = JSON.parse(innerRaw);
  const sentences = inner?.[1]?.[0]?.[0]?.[5];
  if (!Array.isArray(sentences)) throw new Error("Struktur respons tidak dikenali");
  const translated = sentences.map((s) => s?.[0] || "").join("").trim();
  const detectedLang = inner?.[0]?.[2] || "auto";
  return { translated, detectedLang };
}

/**
 * Ekstrak teks OCR dari response WqWDPb via regex.
 *
 * Dari gist, struktur entry[2] = [["base64_gambar","teks_ocr"],"lang"]
 * Response chunked (rt=c) — ada hex chunk sizes embedded di mana saja.
 * Solusi: regex scrape langsung tanpa full JSON parse.
 *
 * Strategi regex:
 * 1. Cari marker "WqWDPb"
 * 2. Setelah itu ada JSON string — ambil semua text dalam tanda kutip ganda
 *    yang merupakan kalimat asli (bukan base64)
 */
function scrapeOcrText(raw) {
  // Hapus awalan security )]}'
  const cleaned = raw.replace(/^\)\]\}'\n?/, "");

  // Cari posisi "WqWDPb"
  const markerIdx = cleaned.indexOf('"WqWDPb"');
  if (markerIdx === -1) return null;

  // Ambil substring setelah "WqWDPb","
  const afterMarker = cleaned.slice(markerIdx + 8);

  // Cari nilai string JSON (mulai dari karakter " pertama)
  const jsonStrStart = afterMarker.indexOf('"');
  if (jsonStrStart === -1) return null;

  // Ambil raw JSON string dengan cara ekstrak semua karakter
  // sampai menemukan penutup yang valid (bukan escaped)
  let depth = 0;
  let inStr = false;
  let escaped = false;
  let start = -1;
  let end = -1;

  for (let i = jsonStrStart; i < afterMarker.length; i++) {
    const ch = afterMarker[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      if (!inStr) {
        inStr = true;
        if (start === -1) start = i;
      } else {
        inStr = false;
        end = i;
        // Lihat apakah ini adalah string JSON yang cukup panjang (bukan key pendek)
        const candidate = afterMarker.slice(start + 1, end);
        if (candidate.length > 20) {
          // Ini adalah JSON string lapis kedua — parse isinya
          try {
            const unescaped = JSON.parse('"' + candidate + '"');
            // unescaped seharusnya dimulai dengan [[ dan berisi array
            // Cari semua teks di dalamnya yang bukan base64
            const texts = extractTextsFromOcrPayload(unescaped);
            if (texts) return texts;
          } catch (_) {}
        }
        break;
      }
    }
  }

  return null;
}

/**
 * Dari payload inner WqWDPb yang sudah di-unescape:
 * formatnya: [["base64...", "teks ocr kalimat 1. teks ocr kalimat 2."],"lang"]
 * atau: [["base64...", "teks ocr"],"lang"]
 *
 * Ambil elemen [0][1] — itu adalah teks OCR yang kita cari.
 * Jika gagal, coba regex ambil semua string non-base64 dalam payload.
 */
function extractTextsFromOcrPayload(payload) {
  try {
    const arr = JSON.parse(payload);
    // arr[0] = ["base64", "teks_ocr"]
    // arr[1] = "lang"
    if (Array.isArray(arr) && Array.isArray(arr[0])) {
      const ocrText = arr[0][1];
      if (ocrText && typeof ocrText === "string" && ocrText.trim().length > 0) {
        return ocrText.trim();
      }
    }
  } catch (_) {}

  // Fallback: regex cari semua string yang bukan base64
  const matches = payload.match(/"([^"]{10,500})"/g);
  if (!matches) return null;

  for (const m of matches) {
    const val = m.slice(1, -1);
    // Skip base64 (karakter alphanumeric + / + = saja, panjang > 100)
    if (/^[A-Za-z0-9+/=]{100,}$/.test(val)) continue;
    // Skip lang code pendek
    if (val.length < 5) continue;
    // Skip URL-like
    if (val.startsWith("http") || val.startsWith("/")) continue;
    return val;
  }

  return null;
}

async function translateText(text, targetLang = "id", sourceLang = "auto") {
  const innerPayload =
    sourceLang === "auto"
      ? `[[${JSON.stringify(text)},"auto","${targetLang}",1,null,2],[]]`
      : `[[${JSON.stringify(text)},"${sourceLang}","${targetLang}",1,null,1],[]]`;

  const freqValue = JSON.stringify([[["MkEWBc", innerPayload, null, "generic"]]]);
  const body = new URLSearchParams({ "f.req": freqValue }).toString();

  const res = await axios.post(GT_TEXT_ENDPOINT, body, {
    headers: HEADERS_TEXT,
    timeout: 15000,
    validateStatus: () => true,
  });

  if (res.status !== 200) {
    throw new Error(`Google Translate HTTP ${res.status} — coba lagi sebentar`);
  }

  const parsed = JSON.parse(res.data.replace(/^\)\]\}'\n/, "").trim());
  return extractTextResult(parsed);
}

/**
 * Translate gambar — dua langkah:
 * 1. Kirim gambar ke WqWDPb endpoint → dapat teks OCR dari gambar
 * 2. Translate teks OCR tersebut ke targetLang via MkEWBc endpoint
 */
async function translateImage(base64Data, targetLang = "id", mimeType = "image/jpeg") {
  const innerPayload = JSON.stringify([[base64Data, mimeType], "auto", targetLang]);
  const freqValue = JSON.stringify([[["WqWDPb", innerPayload, null, "generic"]]]);
  const body = new URLSearchParams({ "f.req": freqValue }).toString();

  // Step 1: OCR via WqWDPb
  const res = await axios.post(GT_IMAGE_ENDPOINT, body, {
    headers: HEADERS_IMAGE,
    timeout: 30000,
    validateStatus: () => true,
    responseType: "text",
    decompress: true,
  });

  if (res.status !== 200) {
    throw new Error(`Google Image OCR HTTP ${res.status} — cookie mungkin kadaluarsa`);
  }

  const raw = typeof res.data === "string" ? res.data : String(res.data);

  // Gunakan regex scraper — tidak perlu full JSON parse
  let ocrText = scrapeOcrText(raw);

  // Jika gagal, retry sekali
  if (!ocrText) {
    await new Promise((r) => setTimeout(r, 2000));
    const res2 = await axios.post(GT_IMAGE_ENDPOINT, body, {
      headers: HEADERS_IMAGE,
      timeout: 30000,
      validateStatus: () => true,
      responseType: "text",
    });
    if (res2.status === 200) {
      ocrText = scrapeOcrText(res2.data);
    }
  }

  if (!ocrText) {
    throw new Error("Tidak ada teks terdeteksi di gambar — pastikan gambar mengandung tulisan yang jelas dan tidak blur");
  }

  // Step 2: Translate teks OCR ke targetLang
  const { translated, detectedLang } = await translateText(ocrText, targetLang, "auto");

  return { translated, ocrText, detectedLang };
}

function buildFormatGuide(prefix, command) {
  const cmd = prefix + command;
  const langRows = Object.entries(LANG_LIST)
    .slice(0, 12)
    .map(([k, v]) => `  ◈ \`${k}\`  →  ${v}`)
    .join("\n");
  return `╔══════════════════════════════╗
║   🌐  PANDUAN FITUR TRANSLATE   ║
╚══════════════════════════════╝
📋 *Format Penggunaan:*
*1️⃣ Tampil Format*
\`${cmd} format\`
*2️⃣ Terjemah Chat → Indonesia*
Reply chat + \`${cmd}\`
atau ketik: \`${cmd} <teks>\`
*3️⃣ Terjemah Chat → Bahasa Lain*
Reply chat + \`${cmd} en\`
atau ketik: \`${cmd} en <teks>\`
*4️⃣ Terjemah Gambar → Indonesia*
Kirim / reply gambar + caption: \`${cmd}\`
*5️⃣ Terjemah Gambar → Bahasa Lain*
Kirim / reply gambar + caption: \`${cmd} en\`
──────────────────────────────
🗺️ *Kode Bahasa Populer:*
${langRows}
  _(+ratusan bahasa lainnya)_
──────────────────────────────
⚡ _Powered by Google Translate_`;
}

function buildOutput({ translated, detectedLang, targetLang, originalText, ocrText, isImage }) {
  const fromName = !detectedLang || detectedLang === "auto" ? "Auto-detect" : getLangName(detectedLang);
  const toName = getLangName(targetLang);
  const sourceBlock = isImage
    ? `📷 *Teks di Gambar* _(${fromName})_\n${ocrText || "—"}`
    : `📝 *Sumber* _(${fromName})_\n${originalText}`;
  return (
    `🌐 *HASIL TERJEMAHAN*\n` +
    `${"─".repeat(28)}\n` +
    `${sourceBlock}\n\n` +
    `🔤 *Terjemahan* _(${toName})_\n` +
    `${translated}\n` +
    `${"─".repeat(28)}\n` +
    `📌 _${fromName}  →  ${toName}_`
  );
}

async function sendWithCopyButton(sock, remoteJid, outputText, translated) {
  return await sock.relayMessage(
    remoteJid,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: { hasMediaAttachment: false },
            body: { text: outputText },
            footer: { text: "Gokufin MD" },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "📋 Salin Terjemahan",
                    copy_code: translated,
                  }),
                },
              ],
            },
          },
        },
      },
    },
    { messageId: sock.generateMessageTag() }
  );
}

async function handle(sock, messageInfo) {
  const { remoteJid, message, content, prefix, command, isQuoted, type } = messageInfo;

  const trimmedContent = (content || "").trim();
  const lowerContent = trimmedContent.toLowerCase();

  if (["format", "help"].includes(lowerContent)) {
    await sock.sendMessage(remoteJid, { text: buildFormatGuide(prefix, command) }, { quoted: message });
    return;
  }

  const hasImage =
    type === "image" ||
    (isQuoted && isQuoted?.type === "image");

  const isReplyChat = isQuoted && isQuoted?.type === "text" && !hasImage;

  try {

    if (hasImage) {
      const { targetLang } = parseArgs(trimmedContent);

      await sock.sendMessage(remoteJid, { react: { text: "🔍", key: message.key } });

      let fileName;
      if (isQuoted && isQuoted?.type === "image") {
        fileName = await downloadQuotedMedia(message);
      } else {
        fileName = await downloadMedia(message);
      }

      if (!fileName) throw new Error("Gagal mengunduh gambar dari pesan");

      const filePath = path.join("tmp", fileName);
      if (!fs.existsSync(filePath)) throw new Error("File gambar tidak ditemukan setelah diunduh");

      const imgBuffer = fs.readFileSync(filePath);
      const mimeType = detectMime(imgBuffer);
      const base64Data = imgBuffer.toString("base64");

      try { fs.unlinkSync(filePath); } catch (_) {}

      const { translated, ocrText, detectedLang } = await translateImage(base64Data, targetLang, mimeType);

      await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });

      const outputText = buildOutput({ translated, detectedLang, targetLang, ocrText, isImage: true });
      await sendWithCopyButton(sock, remoteJid, outputText, translated);
      return;
    }

    let textToTranslate = "";
    let targetLang = "id";

    if (isReplyChat) {
      const quotedText =
        isQuoted?.text ||
        message?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        message?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
        "";

      if (!quotedText) throw new Error("Tidak bisa membaca teks dari pesan yang di-reply");

      const parsed = parseArgs(trimmedContent);
      targetLang = parsed.targetLang;
      textToTranslate = quotedText.trim();
    } else {
      const parsed = parseArgs(trimmedContent);
      targetLang = parsed.targetLang;
      textToTranslate = parsed.text;
    }

    if (!textToTranslate) {
      await sock.sendMessage(remoteJid, { text: buildFormatGuide(prefix, command) }, { quoted: message });
      return;
    }

    if (textToTranslate.length > 5000) {
      await sock.sendMessage(
        remoteJid,
        { text: `⚠️ Teks terlalu panjang! Maksimal *5000* karakter.\n_Teks kamu: ${textToTranslate.length} karakter_` },
        { quoted: message }
      );
      return;
    }

    await sock.sendMessage(remoteJid, { react: { text: "🔄", key: message.key } });

    const { translated, detectedLang } = await translateText(textToTranslate, targetLang, "auto");

    await sock.sendMessage(remoteJid, { react: { text: "✅", key: message.key } });

    const outputText = buildOutput({ translated, detectedLang, targetLang, originalText: textToTranslate, isImage: false });
    await sendWithCopyButton(sock, remoteJid, outputText, translated);

  } catch (error) {
    console.error("[Translate] Error:", error.message);
    await sock.sendMessage(remoteJid, { react: { text: "❌", key: message.key } });
    await sock.sendMessage(
      remoteJid,
      {
        text:
          `⚠️ *Gagal Menerjemahkan!*\n\n` +
          `💡 *Detail Error:*\n${error.message}\n\n` +
          `_Coba lagi atau pastikan kode bahasa yang dipakai valid._`,
      },
      { quoted: message }
    );
  }
}

export default {
  handle,
  Commands: ["translate", "ts", "tl", "tr"],
  OnlyPremium: false,
  OnlyOwner: false,
  limitDeduction: 1,
};