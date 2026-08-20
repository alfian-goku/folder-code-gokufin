const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const crypto = require('crypto');

const API = "https://t2v.aritek.app";
const SIGN = "68d6165b72a7f2d8d17b0dc6fe9691abdf77c583"; // SHA1 cert APK
const VERSION_CODE = 85;
const UA = "okhttp/4.12.0";
const DEVICE_FILE = path.join(__dirname, ".device_id");
const TOKEN_FILE = path.join(__dirname, ".token_cache");

// ---------- Device ID persisten (kuota per-device) ----------
function getDeviceId() {
    if (fs.existsSync(DEVICE_FILE)) {
        return fs.readFileSync(DEVICE_FILE, 'utf8').trim();
    }
    const id = "sniff_" + crypto.randomBytes(8).toString('hex');
    fs.writeFileSync(DEVICE_FILE, id);
    return id;
}

// ---------- Ambil token (cache sampai mendekati expiry ~1 jam) ----------
async function getToken(deviceId) {
    if (fs.existsSync(TOKEN_FILE)) {
        const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
        if (cached.expires > Date.now() && cached.deviceId === deviceId) {
            return cached.token;
        }
    }
    const data = await apiFetch(`${API}/api/v1/user/info`, { method: 'GET' }, deviceId, null);
    const token = data.data.token;
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({
        token,
        deviceId,
        expires: Date.now() + (data.ttl || 3600) * 900
    }));
    return token;
}

// ---------- Generic fetch dengan semua header wajib ----------
async function apiFetch(url, options = {}, deviceId, token, timeoutMs = 300000, retries = 3) {
    for (let attempt = 0; ; attempt++) {
        const headers = {
            'User-Agent': UA,
            'versionCode': String(VERSION_CODE),
            'Ctry-Target': 'others',
            'Device-Id': deviceId,
            'Sign': SIGN,
            ...(options.headers || {})
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), timeoutMs);
        let resp;
        try {
            resp = await fetch(url, { ...options, headers, signal: ac.signal });
        } catch (e) {
            clearTimeout(timer);
            throw new Error(`Koneksi gagal: ${e.message}`);
        }
        clearTimeout(timer);
        const text = await resp.text();
        if (resp.status === 429 && attempt < retries) {
            console.log(`[i] Rate limit (429), tunggu ${30 * (attempt + 1)} detik lalu coba lagi...`);
            await sleep(30000 * (attempt + 1));
            continue;
        }
        let json;
        try { json = JSON.parse(text); } catch { json = { raw: text }; }
        if (resp.status === 401 || (json.code !== undefined && json.code < 0 && json.code !== -21)) {
            throw new Error(`API Error ${resp.status}: ${json.message || text.slice(0, 200)}`);
        }
        return json;
    }
}
async function apiJson(url, options, deviceId, token) {
    const json = await apiFetch(url, options, deviceId, token);
    return json;
}

// ---------- Download file ----------
async function download(url, dest) {
    const resp = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!resp.ok) throw new Error(`Download gagal: HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return buf;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- Input helper (anti-macet saat stdin di-pipe) ----------
let queuedLines = [];
const isTTY = process.stdin.isTTY;
if (!isTTY) {
    const rlAll = readline.createInterface({ input: process.stdin });
    rlAll.on('line', l => queuedLines.push(l));
    rlAll.on('close', () => { rlAll.closed = true; });
}
async function ask(rl, question) {
    if (!isTTY) {
        process.stdout.write(question);
        while (queuedLines.length === 0) await sleep(50);
        return queuedLines.shift();
    }
    return rl.question(question);
}

// ---------- Ganti device ID (kuota per-device) ----------
function rotateDevice() {
    if (fs.existsSync(DEVICE_FILE)) fs.unlinkSync(DEVICE_FILE);
    if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
    return getDeviceId();
}

// ============================================================
//  MAIN
// ============================================================
async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const deviceId = getDeviceId();
    console.log("\n================================================================");
    console.log("  TXT2VI - AI Video Generator );
    console.log("  API: t2v.aritek.app | text-to-video + AI Sound");
    console.log("================================================================");
    console.log(`  Device-Id : ${deviceId}`);
    console.log(`  Sign      : ${SIGN}`);

    const token = await getToken(deviceId);

    // Tampilkan kuota t2v
    try {
        const q = await apiJson(`${API}/api/v1/user/check-limit?type=t2v`, {}, deviceId, token);
        if (q.data) {
            console.log(`  Kuota t2v : sisa ${q.data.remaining}/${q.data.total_limit}${q.data.allowed ? '' : ' (habis)'}`);
        }
    } catch (e) { /* abaikan */ }
    console.log("  Auto-rotate: jika kuota/rate limit habis, ganti guest baru otomatis.\n");

    // Input
    const prompt = (await ask(rl, "Prompt (bahasa Inggris lebih baik): ")).trim();
    if (!prompt) throw new Error("Prompt kosong.");

    console.log("\nAspect ratio:");
    console.log("  [1] auto (default)   [2] 1:1   [3] 16:9   [4] 9:16");
    const arChoice = (await ask(rl, "Pilih (1-4) [1]: ")).trim() || "1";
    const aspectRatio = { "2": "1:1", "3": "16:9", "4": "9:16" }[arChoice] || "auto";

    const aiSound = (await ask(rl, "\nTambah AI Sound/voice ke video? (fitur PRO, gratis) (y/n) [y]: ")).trim().toLowerCase() !== "n";
    const filename = (await ask(rl, `\nNama file output [default: t2v_${Date.now()}.mp4]: `)).trim() || `t2v_${Date.now()}.mp4`;

    // Generate dengan auto-rotate saat kuota/rate limit habis
    let currentDevice = deviceId;
    let currentToken = token;
    let rotated = 0;
    while (true) {
        try {
            const promptStr = prompt;
            const ar = aspectRatio;
            const snd = aiSound;
            const out = filename;
            await generate(parseInt(arChoice) || 1, promptStr, ar, snd ? 1 : 0, out, currentDevice, currentToken);
            break;
        } catch (err) {
            const msg = err.message.toLowerCase();
            const quotaIssue = msg.includes("429") || msg.includes("rate limit") ||
                msg.includes("limit") || msg.includes("quota") || msg.includes("daily");
            if (quotaIssue) {
                rotated++;
                currentDevice = rotateDevice();
                console.log(`\n[i] ${err.message}\n    -> ganti guest baru #${rotated} (${currentDevice}), ulangi...`);
                currentToken = await getToken(currentDevice);
                await sleep(3000);
                continue;
            }
            console.error("\n[X] " + err.message);
            break;
        }
    }
    rl.close();
}

// ---------- Kirim request t2v + download ----------
async function generate(selAr, prompt, aspectRatio, aiSound, filename, deviceId, token) {
    console.log(`\nGenerate video (ratio: ${aspectRatio}, AI sound: ${aiSound ? 'YA' : 'tidak'})...`);
    const body = {
        prompt,
        versionCode: VERSION_CODE,
        deviceID: deviceId,
        isPremium: 1,
        ctry_target: "others",
        used: [],
        aspect_ratio: aspectRatio,
        ai_sound: aiSound
    };
    const res = await apiFetch(`${API}/api/v3/video/t2v`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }, deviceId, token);

    const url = res.data && res.data.url;
    if (!url) throw new Error("Server tidak mengembalikan URL video");

    console.log("URL video: " + url);
    console.log("Mendownload...");
    await download(url, filename);
    console.log(`\n[OK] Video tersimpan: ${filename}`);
}

main().catch(e => { console.error("[FATAL] " + e.message); process.exit(1); });