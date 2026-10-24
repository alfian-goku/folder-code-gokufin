/*
Name Fitur : kimi ai
Base Url : https://www.kimi.ai
Type Code : Scrape | Plugins Esm
Date : 24 - 10 - 2026
Open donations : https://i.supaimg.com/2847d5b1-d408-4ff4-8a34-971c8f52da65/adc23bc1-b25d-451d-8bd9-8ab60fc74a93.jpg
Created By : alfian
Description : You must use the authorization of your Kimi account! So you first scrape the website, then search for *Authorization* <- then copy everything after that word
Chanel : https://whatsapp.com/channel/0029Vb7tD4BKAwEhQBRRVw44 || https://whatsapp.com/channel/0029Vb7IByEKwqSXJw1aX11c
*/

import axios from "axios";
import https from "https";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import * as baileys from "baileys";
import { downloadContentFromMessage } from "baileys";
import { downloadQuotedMedia, downloadMedia } from "../../lib/utils.js"; // sesuaikan | buat reply media dan download

// 1. ID Obrolan Default (Kosongkan "" jika ingin membuat obrolan baru otomatis) | id obrolan? : https://www.kimi.ai/chat/abcdefgh?chat_enter_method=home <- ambil sesudah kata chat
let CHAT_ID = "abvd123";

// 2. isi dengan Authorization Akun Kimi AI kamu (Bisa diisi Bearer Access Token atau Refresh Token akunmu)
const AUTHORIZATION = "Bearer eyJhbGci....";

// 3. Model Default: "k28-instant" (Instant) | "k28-agent-preview" (K2.8) | "k3d1-agent" (K3.1 Pro) | costum model disini
let ACTIVE_MODEL = "k28-instant";

const BASE_URL = "https://www.kimi.ai";
const AUTH_URL = "https://auth.kimi.ai/api/account.gateway.v1.AuthService/RefreshToken";
const TOBID_URL = "https://gator.volces.com/tobid";
const TICKETS_URL = "https://notilo.kimi.ai/ws/tickets";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36";

const UPLOAD_DELAY_MS = 1000;
const ALBUM_CLUSTER_WINDOW_MS = 30000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const httpsAgent = new https.Agent({ keepAlive: true });
const kimiClient = axios.create({
    baseURL: BASE_URL,
    httpsAgent,
    proxy: false,
    timeout: 90000
});

const MODEL_CONFIGS = {
    "instant": {
        id: "k28-instant",
        label: "K2.8 Instant",
        scenario: "SCENARIO_CHAT",
        tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }, { type: "TOOL_TYPE_CRON_JOB" }],
        options: { thinking: true, enable_plugin: true, reasoning_effort: "REASONING_EFFORT_LOW", model: "k28-instant" }
    },
    "k2.8": {
        id: "k28-agent-preview",
        label: "K2.8 Agent Preview",
        scenario: "SCENARIO_CHAT",
        tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }, { type: "TOOL_TYPE_CRON_JOB" }],
        options: { thinking: true, enable_plugin: true, reasoning_effort: "REASONING_EFFORT_HIGH", model: "k28-agent-preview" }
    },
    "k3.1": {
        id: "k3d1-agent",
        label: "K3.1 Pro (OK Computer)",
        scenario: "SCENARIO_OK_COMPUTER",
        tools: [{ type: "TOOL_TYPE_SEARCH", search: {} }, { type: "TOOL_TYPE_ASK_USER" }],
        options: {
            thinking: true,
            enable_plugin: true,
            reasoning_effort: "REASONING_EFFORT_HIGH",
            context_length: "CONTEXT_LENGTH_L",
            model: "k3d1-agent",
            speed: "SPEED_STANDARD"
        }
    }
};

// isi jika mau tahan lama untuk kodenya
const tempSession = {
    baseConfigToken: "",
    accessToken: "",
    refreshToken: "",
    accessExpMs: 0,
    trafficId: "", // isi
    deviceId: "", // isi
    sessionId: "", // isi
    wsTicket: "",
    lastCookieAt: 0,
    lastTobidAt: 0,
    lastTicketAt: 0
};

let cookieJar = { theme: "dark" };
let lastParentMessageId = "";
let refreshLock = null;

function decodeJwt(tokenStr) {
    try {
        const clean = String(tokenStr || "").replace(/^Bearer\s+/i, "").trim();
        const parts = clean.split(".");
        if (parts.length < 2) return null;
        return JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    } catch {
        return null;
    }
}

function updateIdentityFromJwt(tokenStr) {
    const payload = decodeJwt(tokenStr);
    if (!payload) return null;
    if (payload.sub) tempSession.trafficId = String(payload.sub);
    if (payload.device_id) tempSession.deviceId = String(payload.device_id);
    if (payload.ssid) tempSession.sessionId = String(payload.ssid);
    return payload;
}

function initOrResetTempSession() {
    const cleanInput = String(AUTHORIZATION || "").replace(/^Bearer\s+/i, "").trim();
    if (!cleanInput) {
        throw new Error("AUTHORIZATION_EMPTY");
    }

    if (tempSession.baseConfigToken !== cleanInput) {
        tempSession.baseConfigToken = cleanInput;
        tempSession.accessToken = "";
        tempSession.refreshToken = "";
        tempSession.accessExpMs = 0;

        const payload = updateIdentityFromJwt(cleanInput);
        if (payload?.typ === "refresh") {
            tempSession.refreshToken = cleanInput;
        } else {
            tempSession.accessToken = cleanInput;
            tempSession.refreshToken = cleanInput;
            tempSession.accessExpMs = payload?.exp ? Number(payload.exp) * 1000 : (Date.now() + 10 * 60 * 1000);
        }
    }
}

kimiClient.interceptors.request.use((config) => {
    config.proxy = false;
    config.httpsAgent = httpsAgent;
    if (config.url && !config.url.startsWith("http://") && !config.url.startsWith("https://")) {
        config.url = `${BASE_URL}${config.url.startsWith("/") ? "" : "/"}${config.url}`;
    }
    return config;
});

kimiClient.interceptors.response.use((response) => {
    const setCookies = response.headers["set-cookie"];
    if (Array.isArray(setCookies)) {
        setCookies.forEach((c) => {
            const first = c.split(";")[0];
            const idx = first.indexOf("=");
            if (idx > -1) {
                cookieJar[first.substring(0, idx).trim()] = first.substring(idx + 1).trim();
            }
        });
    }
    return response;
});

function generateShieldData() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "sg:";
    for (let i = 0; i < 26; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

function getCookieString() {
    return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
}

function getActiveBearerHeader() {
    const token = tempSession.accessToken || tempSession.baseConfigToken;
    const clean = String(token || "").replace(/^Bearer\s+/i, "").trim();
    return `Bearer ${clean}`;
}

function buildKimiHeaders(chatId = CHAT_ID, extra = {}, includeAuth = true) {
    const refererUrl = chatId
        ? `${BASE_URL}/chat/${chatId}?chat_enter_method=home`
        : `${BASE_URL}/`;

    return {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        ...(includeAuth ? { "authorization": getActiveBearerHeader() } : {}),
        "connect-protocol-version": "1",
        "content-type": "application/json",
        "cookie": getCookieString(),
        "origin": BASE_URL,
        "priority": "u=1, i",
        "r-timezone": "Asia/Makassar",
        "referer": refererUrl,
        "sec-ch-ua": '"Google Chrome";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": USER_AGENT,
        "x-language": "en-US",
        "x-msh-device-id": tempSession.deviceId,
        "x-msh-platform": "web",
        "x-msh-session-id": tempSession.sessionId,
        "x-msh-shield-data": generateShieldData(),
        "x-msh-version": "2.3.0",
        "x-traffic-id": tempSession.trafficId,
        ...extra
    };
}

async function ensureWebCookies(force = false) {
    if (!force && Object.keys(cookieJar).length > 1 && (Date.now() - tempSession.lastCookieAt) < 10 * 60 * 1000) {
        return;
    }
    try {
        await kimiClient.get(`${BASE_URL}/`, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "user-agent": USER_AGENT
            }
        });
        tempSession.lastCookieAt = Date.now();
    } catch {}
}

async function syncVolcesTobidSession(force = false) {
    if (!force && (Date.now() - tempSession.lastTobidAt) < 15 * 60 * 1000) {
        return tempSession.sessionId;
    }
    try {
        const res = await kimiClient.post(
            TOBID_URL,
            {
                app_id: 20001731,
                user_unique_id: tempSession.trafficId,
                web_id: tempSession.deviceId
            },
            {
                headers: {
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
                    "Connection": "keep-alive",
                    "Content-Type": "application/json; charset=UTF-8",
                    "Origin": BASE_URL,
                    "Referer": `${BASE_URL}/`,
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                    "User-Agent": USER_AGENT,
                    "sec-ch-ua": '"Google Chrome";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"'
                }
            }
        );

        if (res.data?.tobid) {
            tempSession.sessionId = String(res.data.tobid);
            tempSession.lastTobidAt = Date.now();
        }
    } catch {}
    return tempSession.sessionId;
}

async function refreshTemporaryAccessToken(force = false) {
    initOrResetTempSession();
    const now = Date.now();

    // Jika token sementara masih aktif (> 90 detik sebelum expired) dan tidak dipaksa refresh, gunakan yang ada
    if (!force && tempSession.accessToken && tempSession.accessExpMs > now + 90 * 1000) {
        return tempSession.accessToken;
    }

    if (refreshLock) {
        return await refreshLock;
    }

    refreshLock = (async () => {
        try {
            const previousAccess = tempSession.accessToken;
            tempSession.accessToken = "";
            tempSession.accessExpMs = 0;

            const candidateRefresh = tempSession.refreshToken || tempSession.baseConfigToken;
            updateIdentityFromJwt(candidateRefresh);

            const refreshHeaders = buildKimiHeaders("", {
                "referer": `${BASE_URL}/`,
                "sec-fetch-site": "same-site"
            }, false);
            delete refreshHeaders["x-language"];

            const res = await kimiClient.post(
                AUTH_URL,
                { refresh_token: candidateRefresh },
                { headers: refreshHeaders }
            );

            const newAccess = res.data?.accessToken || res.data?.access_token;
            const newRefresh = res.data?.refreshToken || res.data?.refresh_token;

            if (newAccess) {
                tempSession.accessToken = newAccess;
                const accPayload = updateIdentityFromJwt(newAccess);
                tempSession.accessExpMs = accPayload?.exp ? Number(accPayload.exp) * 1000 : (Date.now() + 14 * 60 * 1000);
            }
            if (newRefresh) {
                tempSession.refreshToken = newRefresh;
                updateIdentityFromJwt(newRefresh);
            }

            if (!tempSession.accessToken) {
                throw new Error("Empty accessToken from RefreshToken");
            }

            return tempSession.accessToken;
        } catch (err) {
            // Jika user menempelkan Access Token murni (bukan Refresh Token) yang masih belum expired, gunakan sebagai fallback
            const basePayload = decodeJwt(tempSession.baseConfigToken);
            if (basePayload?.typ === "access" && basePayload?.exp && (basePayload.exp * 1000) > Date.now()) {
                tempSession.accessToken = tempSession.baseConfigToken;
                tempSession.accessExpMs = basePayload.exp * 1000;
                return tempSession.accessToken;
            }
            throw err;
        } finally {
            refreshLock = null;
        }
    })();

    return await refreshLock;
}

async function fetchNotiloWsTicket(force = false) {
    if (!force && tempSession.wsTicket && (Date.now() - tempSession.lastTicketAt) < 10 * 60 * 1000) {
        return tempSession.wsTicket;
    }
    try {
        const ticketHeaders = buildKimiHeaders("", {
            "accept": "application/json, text/plain, */*",
            "referer": `${BASE_URL}/`,
            "sec-fetch-site": "same-site"
        }, true);
        delete ticketHeaders["connect-protocol-version"];

        const res = await kimiClient.post(TICKETS_URL, {}, { headers: ticketHeaders });
        if (res.data?.ticket) {
            tempSession.wsTicket = res.data.ticket;
            tempSession.lastTicketAt = Date.now();
        }
    } catch {}
    return tempSession.wsTicket;
}

async function ensureAuthenticatedSession(forceRefresh = false) {
    initOrResetTempSession();
    await ensureWebCookies(forceRefresh);
    await syncVolcesTobidSession(forceRefresh);
    await refreshTemporaryAccessToken(forceRefresh);
    await fetchNotiloWsTicket(forceRefresh);
}

async function executeWithAutoRefresh(requestFn) {
    await ensureAuthenticatedSession(false);
    try {
        return await requestFn();
    } catch (err) {
        const status = err?.response?.status;
        let bodyStr = "";
        if (Buffer.isBuffer(err?.response?.data)) {
            bodyStr = err.response.data.toString("utf8");
        } else if (err?.response?.data) {
            bodyStr = JSON.stringify(err.response.data);
        }

        if (status === 401 || status === 403 || /unauthenticated|expired|unauthorized/i.test(bodyStr)) {
            await ensureAuthenticatedSession(true);
            return await requestFn();
        }
        throw err;
    }
}

function encodeConnectFrame(payloadObj) {
    const jsonBuf = Buffer.from(JSON.stringify(payloadObj), "utf8");
    const header = Buffer.alloc(5);
    header[0] = 0x00;
    header.writeUInt32BE(jsonBuf.length, 1);
    return Buffer.concat([header, jsonBuf]);
}

function parseConnectStreamBuffer(rawBuffer) {
    const buf = Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer || "");
    const events = [];
    let offset = 0;

    while (offset + 5 <= buf.length) {
        const len = buf.readUInt32BE(offset + 1);
        if (len <= 0 || offset + 5 + len > buf.length) break;
        const jsonSlice = buf.subarray(offset + 5, offset + 5 + len).toString("utf8");
        try {
            events.push(JSON.parse(jsonSlice));
        } catch {}
        offset += 5 + len;
    }

    if (events.length === 0 && buf.length > 0) {
        const rawStr = buf.toString("utf8");
        const matches = rawStr.match(/\{[\s\S]*?\}(?=\x00|$)/g) || [];
        for (const m of matches) {
            try { events.push(JSON.parse(m)); } catch {}
        }
    }
    return events;
}

if (!global.__kimiAlbumMediaStore) {
    global.__kimiAlbumMediaStore = new Map();
}
const albumMediaStore = global.__kimiAlbumMediaStore;
const hookedSockets = new WeakSet();
let messageSeqCounter = 0;

function normalizeUserJid(jid) {
    if (!jid || typeof jid !== "string") return "";
    return jid.split(":")[0].split("@")[0].trim();
}

function unwrapMessageContent(msgContent, depth = 0) {
    if (!msgContent || typeof msgContent !== "object" || depth > 8) return msgContent;
    const wrappers = [
        "ephemeralMessage",
        "viewOnceMessage",
        "viewOnceMessageV2",
        "viewOnceMessageV2Extension",
        "documentWithCaptionMessage",
        "associatedChildMessage",
        "groupMentionedMessage",
        "botInvokeMessage",
        "editedMessage"
    ];
    for (const w of wrappers) {
        if (msgContent[w]?.message) {
            return unwrapMessageContent(msgContent[w].message, depth + 1);
        }
    }
    return msgContent;
}

function extractMediaNodeFromMessageObj(rawMessageObj, depth = 0) {
    if (!rawMessageObj || typeof rawMessageObj !== "object" || depth > 6) return null;
    const unwrapped = unwrapMessageContent(rawMessageObj);
    if (!unwrapped || typeof unwrapped !== "object") return null;

    if (unwrapped.imageMessage && (unwrapped.imageMessage.url || unwrapped.imageMessage.directPath || unwrapped.imageMessage.mediaKey)) {
        return { mediaNode: unwrapped.imageMessage, dlType: "image", isImg: true, isVid: false };
    }
    if (unwrapped.videoMessage && (unwrapped.videoMessage.url || unwrapped.videoMessage.directPath || unwrapped.videoMessage.mediaKey)) {
        return { mediaNode: unwrapped.videoMessage, dlType: "video", isImg: false, isVid: true };
    }
    if (unwrapped.documentMessage && (unwrapped.documentMessage.url || unwrapped.documentMessage.directPath || unwrapped.documentMessage.mediaKey)) {
        return { mediaNode: unwrapped.documentMessage, dlType: "document", isImg: false, isVid: false };
    }

    for (const [k, v] of Object.entries(unwrapped)) {
        if (k === "quotedMessage" || k === "contextInfo" || !v || typeof v !== "object") continue;
        const found = extractMediaNodeFromMessageObj(v, depth + 1);
        if (found) return found;
    }
    return null;
}

function getMessageTimestampMs(msg) {
    const rawTs = msg?.messageTimestamp;
    if (!rawTs) return Date.now();
    const num = typeof rawTs === "number" ? rawTs : Number(rawTs?.low || rawTs || 0);
    if (!num) return Date.now();
    return num < 10000000000 ? num * 1000 : num;
}

function getSenderIdNormalized(msg) {
    if (!msg?.key) return "";
    const rawSender = msg.key.participant || msg.participant || (msg.key.fromMe ? "fromMe" : msg.key.remoteJid) || "";
    return normalizeUserJid(rawSender);
}

function findParentAlbumIdDeep(obj, depth = 0) {
    if (!obj || typeof obj !== "object" || depth > 6) return null;
    if (obj.messageAssociation?.parentMessageKey?.id) return obj.messageAssociation.parentMessageKey.id;
    if (obj.parentGroupId && typeof obj.parentGroupId === "string") return obj.parentGroupId;
    for (const [k, v] of Object.entries(obj)) {
        if (k === "quotedMessage" || !v || typeof v !== "object") continue;
        const res = findParentAlbumIdDeep(v, depth + 1);
        if (res) return res;
    }
    return null;
}

function recordIncomingMessages(messagesArray) {
    if (!Array.isArray(messagesArray)) return;
    for (const msg of messagesArray) {
        try {
            const remoteJid = msg?.key?.remoteJid;
            const msgId = msg?.key?.id;
            if (!remoteJid || !msgId || remoteJid === "status@broadcast") continue;

            if (!albumMediaStore.has(remoteJid)) albumMediaStore.set(remoteJid, []);
            const chatList = albumMediaStore.get(remoteJid);

            const unwrapped = unwrapMessageContent(msg.message);
            const mediaExtracted = extractMediaNodeFromMessageObj(msg.message);
            const parentAlbumId = msg?.messageContextInfo?.messageAssociation?.parentMessageKey?.id || findParentAlbumIdDeep(msg.message);
            const albumObj = unwrapped?.albumMessage || msg?.message?.albumMessage;
            const expectedCount = (Number(albumObj?.expectedImageCount) || 0) + (Number(albumObj?.expectedVideoCount) || 0);
            const isAlbumContainer = Boolean(albumObj || (!mediaExtracted && msg.message && !unwrapped?.conversation && !unwrapped?.extendedTextMessage));

            const existing = chatList.find(item => item.id === msgId);
            if (existing) {
                if (!existing.mediaInfo && mediaExtracted) {
                    existing.mediaInfo = mediaExtracted;
                    existing.rawMsg = msg;
                }
                if (!existing.parentAlbumId && parentAlbumId) existing.parentAlbumId = parentAlbumId;
                if (!existing.expectedCount && expectedCount > 0) existing.expectedCount = expectedCount;
                continue;
            }

            chatList.push({
                id: msgId,
                seq: ++messageSeqCounter,
                sender: getSenderIdNormalized(msg),
                fromMe: Boolean(msg?.key?.fromMe),
                timestamp: getMessageTimestampMs(msg),
                parentAlbumId,
                isAlbumContainer,
                expectedCount,
                mediaInfo: mediaExtracted,
                rawMsg: msg
            });

            if (chatList.length > 250) chatList.splice(0, chatList.length - 250);
        } catch {}
    }
}

try {
    const protoRoot = baileys?.proto || baileys?.default?.proto || baileys?.WAProto;
    const WebMsgInfo = protoRoot?.WebMessageInfo;
    if (WebMsgInfo && !WebMsgInfo.__kimiAlbumHooked) {
        WebMsgInfo.__kimiAlbumHooked = true;
        for (const fnName of ["fromObject", "create"]) {
            if (typeof WebMsgInfo[fnName] === "function") {
                const origFn = WebMsgInfo[fnName];
                WebMsgInfo[fnName] = function (...args) {
                    const res = origFn.apply(this, args);
                    try {
                        if (res?.key?.remoteJid && res?.key?.id) {
                            recordIncomingMessages([res]);
                            const t = setTimeout(() => {
                                try { recordIncomingMessages([res]); } catch {}
                            }, 700);
                            if (typeof t?.unref === "function") t.unref();
                        }
                    } catch {}
                    return res;
                };
            }
        }
    }
} catch {}

function ensureSocketAlbumListener(sock) {
    try {
        if (!sock || typeof sock !== "object" || hookedSockets.has(sock)) return;
        hookedSockets.add(sock);
        if (sock.ev && typeof sock.ev.on === "function") {
            sock.ev.on("messages.upsert", (upsertData) => {
                if (upsertData?.messages) recordIncomingMessages(upsertData.messages);
            });
        }
    } catch {}
}

async function setReaction(sock, remoteJid, message, emoji) {
    if (!sock || !remoteJid || !message?.key) return;
    try {
        await sock.sendMessage(remoteJid, { react: { text: emoji, key: message.key } });
    } catch {}
}

function toText(value) {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        return value.text || value.content || value.caption || value.conversation || value.body || "";
    }
    return "";
}

function stripCommandPrefix(input, prefix, command) {
    const text = toText(input).trim();
    if (!text) return "";
    const cmd = toText(command);
    const pre = toText(prefix);
    if (pre && cmd && text.toLowerCase().startsWith((pre + cmd).toLowerCase())) {
        return text.slice((pre + cmd).length).trim();
    }
    if (cmd) {
        const escaped = String(cmd).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return text.replace(new RegExp(`^[.!#/\\\\]?${escaped}\\b\\s*`, "i"), "").trim();
    }
    return text;
}

function resolveMimeTypeByFilename(fileName, fallbackMime) {
    const ext = path.extname(fileName || "").toLowerCase();
    const mimeMap = {
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".ts": "text/typescript",
        ".txt": "text/plain",
        ".json": "application/json",
        ".py": "text/x-python",
        ".html": "text/html",
        ".css": "text/css",
        ".md": "text/markdown",
        ".csv": "text/csv",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".mkv": "video/x-matroska",
        ".webm": "video/webm",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp"
    };
    return mimeMap[ext] || fallbackMime || "application/octet-stream";
}

function isSameSenderCluster(itemA, itemB, quotedParticipantNorm) {
    if (!itemA || !itemB) return false;
    if (itemA.fromMe && itemB.fromMe) return true;
    if (itemA.sender && itemB.sender && itemA.sender === itemB.sender) return true;
    if (quotedParticipantNorm && (itemA.sender === quotedParticipantNorm || itemB.sender === quotedParticipantNorm)) return true;
    if (Math.abs(itemA.timestamp - itemB.timestamp) <= 8000) return true;
    return false;
}

function getOrderedAlbumMediaTargets(remoteJid, quotedStanzaId, quotedParticipant, quotedMsg, sock) {
    if (!remoteJid || !quotedStanzaId) return [];

    try {
        const rawStoreMsgs =
            sock?.store?.messages?.[remoteJid]?.array ||
            sock?.store?.messages?.[remoteJid] ||
            global.store?.messages?.[remoteJid]?.array ||
            global.store?.messages?.[remoteJid];
        if (Array.isArray(rawStoreMsgs)) recordIncomingMessages(rawStoreMsgs);
        else if (rawStoreMsgs && typeof rawStoreMsgs.values === "function") {
            recordIncomingMessages(Array.from(rawStoreMsgs.values()));
        }
    } catch {}

    const chatHistory = (albumMediaStore.get(remoteJid) || []).slice().sort((a, b) => a.seq - b.seq);
    const mediaOnlyHistory = chatHistory.filter(item => item.mediaInfo !== null);
    if (mediaOnlyHistory.length === 0) return [];

    const quotedParticipantNorm = normalizeUserJid(quotedParticipant);
    const targetRecord = chatHistory.find(item => item.id === quotedStanzaId);

    const candidateParentIds = new Set([quotedStanzaId]);
    if (targetRecord?.parentAlbumId) candidateParentIds.add(targetRecord.parentAlbumId);

    const byParentId = mediaOnlyHistory.filter(item => item.parentAlbumId && candidateParentIds.has(item.parentAlbumId));
    if (byParentId.length > 0) return byParentId.sort((a, b) => a.seq - b.seq);

    let anchorIdx = mediaOnlyHistory.findIndex(item => item.id === quotedStanzaId);
    if (anchorIdx === -1 && targetRecord) {
        anchorIdx = mediaOnlyHistory.findIndex(
            item =>
                Math.abs(item.timestamp - targetRecord.timestamp) <= ALBUM_CLUSTER_WINDOW_MS &&
                isSameSenderCluster(item, targetRecord, quotedParticipantNorm)
        );
    }

    if (anchorIdx !== -1) {
        let startIdx = anchorIdx;
        let endIdx = anchorIdx;
        while (startIdx > 0) {
            if (
                Math.abs(mediaOnlyHistory[startIdx].timestamp - mediaOnlyHistory[startIdx - 1].timestamp) <= ALBUM_CLUSTER_WINDOW_MS &&
                isSameSenderCluster(mediaOnlyHistory[startIdx - 1], mediaOnlyHistory[startIdx], quotedParticipantNorm)
            ) {
                startIdx--;
            } else break;
        }
        while (endIdx < mediaOnlyHistory.length - 1) {
            if (
                Math.abs(mediaOnlyHistory[endIdx + 1].timestamp - mediaOnlyHistory[endIdx].timestamp) <= ALBUM_CLUSTER_WINDOW_MS &&
                isSameSenderCluster(mediaOnlyHistory[endIdx], mediaOnlyHistory[endIdx + 1], quotedParticipantNorm)
            ) {
                endIdx++;
            } else break;
        }
        return mediaOnlyHistory.slice(startIdx, endIdx + 1);
    }

    const unwrappedQuoted = unwrapMessageContent(quotedMsg);
    const isAlbumBubble =
        Boolean(unwrappedQuoted?.albumMessage) ||
        (!extractMediaNodeFromMessageObj(quotedMsg) && !unwrappedQuoted?.conversation && !unwrappedQuoted?.extendedTextMessage?.text);

    if (isAlbumBubble && mediaOnlyHistory.length > 0) {
        const senderFiltered = quotedParticipantNorm ? mediaOnlyHistory.filter(i => i.sender === quotedParticipantNorm) : [];
        const pool = senderFiltered.length > 0 ? senderFiltered : mediaOnlyHistory;
        let endIdx = pool.length - 1;
        let startIdx = endIdx;
        while (startIdx > 0 && Math.abs(pool[startIdx].timestamp - pool[startIdx - 1].timestamp) <= ALBUM_CLUSTER_WINDOW_MS) {
            startIdx--;
        }
        return pool.slice(startIdx, endIdx + 1);
    }

    return [];
}

async function downloadSingleMediaNode(targetMediaNode, dlType, fallbackMessage, isQuotedFallback, indexNum = 1) {
    let buffer = Buffer.from([]);
    try {
        const stream = await downloadContentFromMessage(targetMediaNode, dlType);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
    } catch {
        if (fallbackMessage) {
            const fb = isQuotedFallback ? await downloadQuotedMedia(fallbackMessage, true) : await downloadMedia(fallbackMessage, true);
            if (Buffer.isBuffer(fb)) buffer = fb;
            else if (typeof fb === "string" && fs.existsSync(fb)) buffer = fs.readFileSync(fb);
        }
    }

    if (!buffer || buffer.length === 0) {
        throw new Error(`Gagal mengunduh media ke-${indexNum} dari WhatsApp.`);
    }

    const isImg = dlType === "image";
    const isVid = dlType === "video";
    const rawMime = targetMediaNode.mimetype || (isImg ? "image/jpeg" : (isVid ? "video/mp4" : "application/octet-stream"));
    const defaultExt = isImg ? "jpeg" : (isVid ? "mp4" : "txt");
    const ext = rawMime.split("/")[1]?.split(";")[0] || defaultExt;
    const fileName = targetMediaNode.fileName || (isImg
        ? `WhatsApp Image ${Date.now()}_${indexNum}.${ext}`
        : (isVid ? `WhatsApp Video ${Date.now()}_${indexNum}.mp4` : `file_${Date.now()}_${indexNum}.${ext}`));

    return {
        buffer,
        mimeType: resolveMimeTypeByFilename(fileName, rawMime),
        fileName
    };
}

async function extractUserPromptAndAttachments(sock, messageInfo, onDownloadStart) {
    const message = messageInfo?.message;
    const remoteJid = messageInfo?.remoteJid || message?.key?.remoteJid;
    const prefix = toText(messageInfo?.prefix);
    const command = toText(messageInfo?.command);
    const content = toText(messageInfo?.content);
    const isQuoted = messageInfo?.isQuoted;

    const unwrappedDirect = unwrapMessageContent(message?.message || {});
    const contextInfo =
        unwrappedDirect?.extendedTextMessage?.contextInfo ||
        unwrappedDirect?.imageMessage?.contextInfo ||
        unwrappedDirect?.videoMessage?.contextInfo ||
        unwrappedDirect?.documentMessage?.contextInfo ||
        message?.message?.extendedTextMessage?.contextInfo ||
        null;

    const quotedMsg = contextInfo?.quotedMessage || isQuoted?.message || null;
    const quotedStanzaId = contextInfo?.stanzaId || isQuoted?.id || isQuoted?.key?.id || null;
    const quotedParticipant = contextInfo?.participant || isQuoted?.sender || "";

    // 1. Deteksi media yang dikirim langsung atau di-reply
    const directExtracted = extractMediaNodeFromMessageObj(unwrappedDirect);
    const quotedExtracted = extractMediaNodeFromMessageObj(quotedMsg);

    // 2. Deteksi teks dari pesan yang di-reply (support semua tipe pesan teks/caption)
    const unwrappedQuoted = unwrapMessageContent(quotedMsg);
    const quotedText =
        unwrappedQuoted?.conversation ||
        unwrappedQuoted?.extendedTextMessage?.text ||
        unwrappedQuoted?.imageMessage?.caption ||
        unwrappedQuoted?.videoMessage?.caption ||
        unwrappedQuoted?.documentMessage?.caption ||
        toText(isQuoted?.text) ||
        toText(isQuoted?.body) ||
        toText(isQuoted?.content) ||
        toText(isQuoted?.caption) ||
        toText(isQuoted?.conversation) ||
        "";

    const rawDirectCaption =
        unwrappedDirect?.imageMessage?.caption ||
        unwrappedDirect?.videoMessage?.caption ||
        unwrappedDirect?.documentMessage?.caption ||
        unwrappedDirect?.conversation ||
        unwrappedDirect?.extendedTextMessage?.text ||
        "";

    const userTypedPrompt = content ? content.trim() : stripCommandPrefix(rawDirectCaption, prefix, command);
    const cleanedQuotedText = stripCommandPrefix(quotedText, prefix, command);

    // 3. Cek apakah user me-reply sebuah Album Media
    let albumTargets = [];
    if (!directExtracted && quotedStanzaId) {
        albumTargets = getOrderedAlbumMediaTargets(remoteJid, quotedStanzaId, quotedParticipant, quotedMsg, sock);
    }

    const hasAnyMedia = Boolean(directExtracted || quotedExtracted || albumTargets.length > 0);

    // Gabungkan prompt ketikan user dengan teks pesan yang di-reply (jika me-reply chat teks)
    let finalPrompt = userTypedPrompt;
    if (!finalPrompt && cleanedQuotedText) {
        finalPrompt = cleanedQuotedText;
    } else if (finalPrompt && cleanedQuotedText && !hasAnyMedia) {
        finalPrompt = `${finalPrompt}\n\n${cleanedQuotedText}`;
    } else if (finalPrompt && cleanedQuotedText && hasAnyMedia && finalPrompt !== cleanedQuotedText) {
        finalPrompt = `${finalPrompt}\n\n${cleanedQuotedText}`;
    }

    if (!hasAnyMedia) return { promptText: finalPrompt, attachments: [] };

    if (typeof onDownloadStart === "function") await onDownloadStart();

    if (directExtracted) {
        const single = await downloadSingleMediaNode(directExtracted.mediaNode, directExtracted.dlType, message, false, 1);
        return { promptText: finalPrompt, attachments: [single] };
    }

    if (albumTargets.length > 1) {
        const attachments = [];
        for (let i = 0; i < albumTargets.length; i++) {
            const item = albumTargets[i];
            const att = await downloadSingleMediaNode(item.mediaInfo.mediaNode, item.mediaInfo.dlType, item.rawMsg, false, i + 1);
            attachments.push(att);
        }
        return { promptText: finalPrompt, attachments };
    }

    const singleTarget = albumTargets[0]?.mediaInfo || quotedExtracted;
    const singleRawMsg = albumTargets[0]?.rawMsg || message;
    if (singleTarget) {
        const single = await downloadSingleMediaNode(singleTarget.mediaNode, singleTarget.dlType, singleRawMsg, !albumTargets[0]?.rawMsg, 1);
        return { promptText: finalPrompt, attachments: [single] };
    }

    return { promptText: finalPrompt, attachments: [] };
}

// =========================================================================
// HELPER UPLOAD FILE / MEDIA KE KIMI AI & CEK PARSE PROGRESS
// =========================================================================
function buildMultipartPayload(buffer, fileName, mimeType) {
    const boundary = "----WebKitFormBoundary" + crypto.randomBytes(8).toString("hex");
    const safeName = String(fileName || "file.bin").replace(/"/g, "");
    const headerStr =
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${safeName}"\r\n` +
        `Content-Type: ${mimeType}\r\n\r\n`;
    const footerStr = `\r\n--${boundary}--\r\n`;

    return {
        boundary,
        bodyBuffer: Buffer.concat([Buffer.from(headerStr, "utf8"), buffer, Buffer.from(footerStr, "utf8")])
    };
}

async function uploadSingleFileToKimi(attachment) {
    return await executeWithAutoRefresh(async () => {
        const { boundary, bodyBuffer } = buildMultipartPayload(attachment.buffer, attachment.fileName, attachment.mimeType);
        const headers = buildKimiHeaders(CHAT_ID, {
            "accept": "application/json, text/plain, */*",
            "content-type": `multipart/form-data; boundary=${boundary}`
        });
        delete headers["connect-protocol-version"];

        const res = await kimiClient.post("/apiv2-files/file/upload", bodyBuffer, {
            headers,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        const fileObj = res.data?.file;
        if (!fileObj?.id) {
            throw new Error(`Gagal mengunggah file ${attachment.fileName} ke Kimi AI.`);
        }
        return fileObj.id;
    });
}

async function waitForFileParseProgress(fileIds) {
    if (!Array.isArray(fileIds) || fileIds.length === 0) return;

    for (let attempt = 0; attempt < 15; attempt++) {
        try {
            const res = await kimiClient.post(
                "/apiv2-files/kimi.gateway.file.v1.FileService/GetFileParseProgress",
                { file_ids: fileIds },
                { headers: buildKimiHeaders(CHAT_ID) }
            );
            const progresses = res.data?.progresses || [];
            const stillProcessing = progresses.some(p => p.status === "PROCESS_STATUS_PROCESSING");
            if (!stillProcessing) return;
        } catch {
            return;
        }
        await sleep(1200);
    }
}

async function uploadAttachmentsSequentiallyToKimi(attachments) {
    const uploadedIds = [];
    for (let i = 0; i < attachments.length; i++) {
        if (i > 0) await sleep(UPLOAD_DELAY_MS);
        const fid = await uploadSingleFileToKimi(attachments[i]);
        uploadedIds.push(fid);
    }
    await waitForFileParseProgress(uploadedIds);
    return uploadedIds;
}

function formatWitaTime(isoString) {
    if (!isoString) return "-";
    try {
        const d = new Date(isoString);
        const formatted = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Makassar",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(d);
        return `${formatted} WITA`;
    } catch {
        return isoString;
    }
}

function cleanKimiMessageContent(rawText, firstToolIntroBlock = "") {
    if (!rawText) return "";
    let text = String(rawText);

    // 1. Konversi karakter escaped (\n\n, \n, \r, \")
    text = text
        .replace(/\\n\\n/g, "\n\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\"/g, '"')
        .trim();

    // 2. Hapus kalimat pengantar pencarian/tool di awal respon
    if (firstToolIntroBlock && text.startsWith(firstToolIntroBlock) && text.length > firstToolIntroBlock.length + 5) {
        text = text.slice(firstToolIntroBlock.length).trim();
    }

    const gluedIntroMatch = text.match(/^([^\n]{5,240}?[a-zA-Z0-9)!?])\.([A-Z][\s\S]+)$/);
    if (gluedIntroMatch && !/https?:\/\/|www\./i.test(gluedIntroMatch[1])) {
        text = gluedIntroMatch[2].trim();
    }

    text = text.replace(
        /^(?:(?:Tentu|Baik|Oke|Siap|Halo)[!,. ]*)?(?:Saya|Aku|Mari\s+saya|Akan\s+saya|Izinkan\s+saya)\s+(?:akan\s+|bantu\s+)?(?:carikan|mencarikan|buatkan|membuatkan|cek|mengecek|telusuri|analisis\s+dulu)[^.!?\n]{0,180}[.!?]\s*(?=[A-Z])/i,
        ""
    ).trim();

    // 3. Bersihkan sitasi pencarian Kimi:
    text = text.replace(
        /[ \t]*\[?cite[\u2726✦*]tools:\/\/[^\s\]\n]*?:~:text=([^\n\]]+?)\]?(?=[ \t]*\n|$|[ \t]*\[?cite[\u2726✦*]tools:\/\/)/gi,
        (_, snippet) => {
            let cleanSnippet = snippet.trim();
            try {
                cleanSnippet = decodeURIComponent(cleanSnippet);
            } catch {}
            cleanSnippet = cleanSnippet.replace(/\*{2,}/g, "*").trim();
            return cleanSnippet ? ` ( ${cleanSnippet} )` : "";
        }
    );

    text = text.replace(/[ \t]*\[?cite[\u2726✦*]tools:\/\/[^\s\]\n]+\]?/gi, "");

    // 4. Konversi Tabel Markdown (| Kebutuhan | Pilihan |) menjadi daftar poin WhatsApp
    text = text.replace(/^(\|.+\|[ \t]*\n?)+/gm, (tableBlock) => {
        const lines = tableBlock.trim().split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return tableBlock;

        const hasSeparator = lines.some(l => /^\|[\s:|-]+\|$/.test(l));
        const dataLines = lines.filter((l, idx) => {
            if (/^\|[\s:|-]+\|$/.test(l)) return false;
            if (idx === 0 && hasSeparator && lines.length > 2) return false;
            return true;
        });

        const formattedRows = dataLines.map(line => {
            const cols = line
                .replace(/^\||\|$/g, "")
                .split("|")
                .map(c => c.trim().replace(/\*{2,}/g, "*"))
                .filter(Boolean);
            if (cols.length === 0) return "";
            if (cols.length === 1) return `- ${cols[0]}`;
            const firstCol = cols[0].replace(/^\*+|\*+$/g, "");
            return `- *${firstCol}*: ${cols.slice(1).join(" — ")}`;
        }).filter(Boolean);

        return formattedRows.length > 0 ? formattedRows.join("\n") + "\n" : "";
    });

    // 5. Hapus garis pembatas horizontal Markdown (---, ***, ___)
    text = text.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, "");

    // 6. Hapus seluruh blok & kode HTML (```html ... ```, <!DOCTYPE html>, <html>, <style>, <script>)
    text = text.replace(/```(?:html|htm|xml|svg|css)\b[\s\S]*?(?:```|$)/gi, "");
    text = text.replace(/<!DOCTYPE\s+html[\s\S]*$/gi, "");
    text = text.replace(/<html\b[\s\S]*$/gi, "");
    text = text.replace(/<(?:style|script|head|svg)\b[^>]*>[\s\S]*?(?:<\/(?:style|script|head|svg)>|$)/gi, "");

    // 7. Ubah elemen <button> atau blok command menjadi ala button teks dengan * dan ```
    const savedButtonBlocks = [];
    text = text.replace(/<button\b[^>]*>([\s\S]*?)<\/button>/gi, (_, btnText) => {
        const cleanBtn = btnText.replace(/<[^>]+>/g, "").trim();
        if (!cleanBtn) return "";
        const token = `@@KIMI_BTN_${savedButtonBlocks.length}@@`;
        savedButtonBlocks.push(`*Button*\n\`\`\`${cleanBtn}\`\`\``);
        return `\n${token}\n`;
    });

    text = text.replace(/<a\b[^>]*?\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, label) => {
        const cleanLabel = label.replace(/<[^>]+>/g, "").trim();
        if (cleanLabel && url && cleanLabel !== url) return `${cleanLabel} (${url})`;
        return url || cleanLabel || "";
    });

    // Amankan blok ```...``` non-HTML menggunakan simbol * dan ```
    text = text.replace(/```([a-zA-Z0-9_-]*)\s*\n?([\s\S]*?)(?:```|$)/g, (_, lang, codeBody) => {
        const cleanLang = (lang || "").trim();
        const cleanCode = (codeBody || "").trim();
        if (!cleanCode || /<\/?[a-zA-Z][^>]*>/.test(cleanCode)) return "";

        const formatted = cleanLang
            ? `*${cleanLang}*\n\`\`\`${cleanCode}\`\`\``
            : `\`\`\`${cleanCode}\`\`\``;
        const token = `@@KIMI_BTN_${savedButtonBlocks.length}@@`;
        savedButtonBlocks.push(formatted);
        return `\n\n${token}\n\n`;
    });

    // Ubah satu backtick `teks` menjadi ```teks``` agar hanya simbol * dan ``` yang digunakan
    text = text.replace(/`([^`\n]+)`/g, (_, inlineStr) => {
        const cleanInline = inlineStr.trim();
        if (!cleanInline || /^<\/?[a-zA-Z][^>]*>$/.test(cleanInline)) return "";
        const token = `@@KIMI_BTN_${savedButtonBlocks.length}@@`;
        savedButtonBlocks.push(`\`\`\`${cleanInline}\`\`\``);
        return token;
    });

    // 8. Hapus seluruh sisa tag HTML
    text = text.replace(/<\/?[a-zA-Z][a-zA-Z0-9_-]*(?:\s+[^<>]*)?>/g, "");
    text = text.replace(/<[a-zA-Z!/][^>]*$/g, "");

    // 9. Format Link Markdown, Heading (# -> *Judul*), dan Bold (** -> *)
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 ($2)");
    text = text.replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, (_, headingText) => {
        const cleanHeading = headingText.replace(/\*+/g, "").trim();
        return `*${cleanHeading}*`;
    });
    text = text.replace(/\*{2,}([^*\n]+?)\*{2,}/g, "*$1*");
    text = text.replace(/\*{2,}/g, "*");

    // 10. Kembalikan blok ``` (button / kode)
    savedButtonBlocks.forEach((val, idx) => {
        text = text.split(`@@KIMI_BTN_${idx}@@`).join(val);
    });

    text = text.replace(/:\s*$/, ".");

    return text
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// =========================================================================
// HELPER RESOLVE & DOWNLOAD FILE DARI SANDBOX KIMI AI
// =========================================================================
async function resolveAndDownloadSandboxFile(chatId, fileUri) {
    return await executeWithAutoRefresh(async () => {
        const res = await kimiClient.post(
            "/apiv2/kimi.gateway.mcp.v1.OKCService/ResolveFileURI",
            { chat_id: chatId, file_uri: fileUri },
            { headers: buildKimiHeaders(chatId) }
        );

        const downloadUrl = res.data?.downloadUrl;
        if (!downloadUrl) return null;

        const fileRes = await kimiClient.get(downloadUrl, {
            headers: buildKimiHeaders(chatId, { "accept": "*/*" }),
            responseType: "arraybuffer"
        });

        const rawFileName = path.basename(fileUri.replace(/^sandbox:\/\//i, "")) || `kimi_output_${Date.now()}.txt`;
        return {
            buffer: Buffer.from(fileRes.data),
            fileName: rawFileName,
            mimeType: resolveMimeTypeByFilename(rawFileName, "application/octet-stream")
        };
    });
}

function extractUuidFromInput(rawInput) {
    const clean = toText(rawInput).trim();
    const match = clean.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    return match ? match[0] : clean;
}

async function fetchKimiListFeeds(pageSize = 15) {
    return await executeWithAutoRefresh(async () => {
        const res = await kimiClient.post(
            "/apiv2/kimi.gateway.feed.v1.FeedService/ListFeeds",
            {
                page_size: pageSize,
                project_id: "",
                filter_types: ["FEED_TYPE_CHAT", "FEED_TYPE_TASK"],
                include_pinned: false
            },
            { headers: buildKimiHeaders(CHAT_ID) }
        );
        return res.data?.items || [];
    });
}

async function handle(sock, messageInfo) {
    const { remoteJid, message, alfianxd } = messageInfo;
    const prefix = toText(messageInfo?.prefix);
    const command = toText(messageInfo?.command).toLowerCase();
    const rawContent = toText(messageInfo?.content).trim();

    ensureSocketAlbumListener(sock);

    try {
        await setReaction(sock, remoteJid, message, "🔍");

        // =================================================================
        // 1. COMMAND GANTI MODEL (.kimimodel <instant|k2.8|k3.1>)
        // =================================================================
        if (command === "kimimodel") {
            const arg = rawContent.toLowerCase();
            let selected = null;
            if (arg === "1" || arg === "instant" || arg === "k28-instant") selected = MODEL_CONFIGS["instant"];
            else if (arg === "2" || arg === "k2.8" || arg === "k28" || arg === "k28-agent-preview") selected = MODEL_CONFIGS["k2.8"];
            else if (arg === "3" || arg === "k3.1" || arg === "pro" || arg === "k3d1-agent") selected = MODEL_CONFIGS["k3.1"];

            if (!selected) {
                const currentCfg = Object.values(MODEL_CONFIGS).find(m => m.id === ACTIVE_MODEL) || MODEL_CONFIGS["instant"];
                await sock.sendMessage(
                    remoteJid,
                    {
                        text: `🤖 *PILIHAN MODEL KIMI AI*\n` +
                              `Model Aktif: *${currentCfg.label}* (\`\`\`${currentCfg.id}\`\`\`)\n\n` +
                              `1️⃣ \`\`\`${prefix}kimimodel instant\`\`\` — K2.8 Instant\n` +
                              `2️⃣ \`\`\`${prefix}kimimodel k2.8\`\`\` — K2.8 Agent Preview\n` +
                              `3️⃣ \`\`\`${prefix}kimimodel k3.1\`\`\` — K3.1 Pro (OK Computer)`
                    },
                    { quoted: message }
                );
                await setReaction(sock, remoteJid, message, "✅");
                return;
            }

            ACTIVE_MODEL = selected.id;
            await sock.sendMessage(
                remoteJid,
                { text: `✅ Model Kimi AI berhasil diubah ke *${selected.label}* (\`\`\`${selected.id}\`\`\`).` },
                { quoted: message }
            );
            await setReaction(sock, remoteJid, message, "✅");
            return;
        }

        // =================================================================
        // 2. COMMAND HAPUS OBROLAN (.kimidel / .kimidelob <id atau link>)
        // =================================================================
        if (command === "kimidel" || command === "kimidelob") {
            const targetId = extractUuidFromInput(rawContent);
            if (!targetId) {
                await setReaction(sock, remoteJid, message, "❌");
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `⚠️ *Format Hapus Obrolan Kimi AI:*\n` +
                              `• \`\`\`${prefix + command} <id obrolan>\`\`\`\n` +
                              `• \`\`\`${prefix + command} [https://www.kimi.ai/chat/abcd](https://www.kimi.ai/chat/abcde21)\`\`\``
                    },
                    { quoted: message }
                );
            }

            await setReaction(sock, remoteJid, message, "🔄");
            const delRes = await executeWithAutoRefresh(async () => {
                return await kimiClient.post(
                    "/apiv2/kimi.chat.v1.ChatService/DeleteChat",
                    { chat_id: targetId },
                    { headers: buildKimiHeaders(targetId) }
                );
            });

            const deletedId = delRes.data?.chatId || targetId;
            if (CHAT_ID === deletedId) lastParentMessageId = "";

            await sock.sendMessage(
                remoteJid,
                { text: `✅ Obrolan Kimi AI dengan ID \`\`\`${deletedId}\`\`\` berhasil dihapus.` },
                { quoted: message }
            );
            await setReaction(sock, remoteJid, message, "✅");
            return;
        }

        // =================================================================
        // 3. COMMAND GANTI NAMA OBROLAN (.kimirename <nama baru> atau <id> | <nama>)
        // =================================================================
        if (command === "kimirename") {
            if (!rawContent) {
                await setReaction(sock, remoteJid, message, "❌");
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `⚠️ *Format Ganti Nama Obrolan Kimi AI:*\n` +
                              `• \`\`\`${prefix}kimirename <nama baru>\`\`\`\n` +
                              `• \`\`\`${prefix}kimirename <id/link> | <nama baru>\`\`\``
                    },
                    { quoted: message }
                );
            }

            let targetChatId = CHAT_ID;
            let newChatName = rawContent;

            if (rawContent.includes("|")) {
                const [idPart, ...nameParts] = rawContent.split("|");
                targetChatId = extractUuidFromInput(idPart) || CHAT_ID;
                newChatName = nameParts.join("|").trim();
            }

            if (!targetChatId || !newChatName) {
                throw new Error("ID obrolan atau nama baru tidak valid.");
            }

            await setReaction(sock, remoteJid, message, "🔄");
            const updRes = await executeWithAutoRefresh(async () => {
                return await kimiClient.post(
                    "/apiv2/kimi.chat.v1.ChatService/UpdateChat",
                    { chat: { id: targetChatId, name: newChatName } },
                    { headers: buildKimiHeaders(targetChatId) }
                );
            });

            const updated = updRes.data?.chat || { id: targetChatId, name: newChatName };
            await sock.sendMessage(
                remoteJid,
                { text: `✅ Nama obrolan \`\`\`${updated.id}\`\`\` berhasil diubah menjadi *${updated.name}*.` },
                { quoted: message }
            );
            await setReaction(sock, remoteJid, message, "✅");
            return;
        }

        // =================================================================
        // 4. COMMAND LIST OBROLAN (.kimilist / .kimiinfo)
        // =================================================================
        if (command === "kimilist" || command === "kimiinfo") {
            await setReaction(sock, remoteJid, message, "🔄");
            const items = await fetchKimiListFeeds(15);
            const chatItems = items.filter(i => i.chat?.id);

            if (chatItems.length === 0) {
                await sock.sendMessage(
                    remoteJid,
                    { text: "ℹ️ Belum ada riwayat obrolan di akun Kimi AI ini." },
                    { quoted: message }
                );
                await setReaction(sock, remoteJid, message, "✅");
                return;
            }

            let listMsg = `🗂️ *DAFTAR OBROLAN KIMI AI (WITA)*\n\n`;
            chatItems.forEach((item, idx) => {
                const c = item.chat;
                listMsg +=
                    `${idx + 1}. *${c.name || "Tanpa Judul"}*\n` +
                    `   • *ID:* \`\`\`${c.id}\`\`\`\n` +
                    `   • *Dibuat:* ${formatWitaTime(c.createTime)}\n` +
                    `   • *Diperbarui:* ${formatWitaTime(c.updateTime)}\n\n`;
            });

            await sock.sendMessage(remoteJid, { text: listMsg.trim() }, { quoted: message });
            await setReaction(sock, remoteJid, message, "✅");
            return;
        }

        const { promptText, attachments } = await extractUserPromptAndAttachments(
            sock,
            messageInfo,
            async () => {
                await setReaction(sock, remoteJid, message, "⬇️");
            }
        );

        if (!promptText && attachments.length === 0) {
            const currentCfg = Object.values(MODEL_CONFIGS).find(m => m.id === ACTIVE_MODEL) || MODEL_CONFIGS["instant"];
            await setReaction(sock, remoteJid, message, "❌");
            return await sock.sendMessage(
                remoteJid,
                {
                    text: `🌙 *PANDUAN PENGGUNAAN KIMI AI*\n` +
                          `Model Aktif: *${currentCfg.label}* (\`\`\`${currentCfg.id}\`\`\`)\n` +
                          `ID Obrolan: \`\`\`${CHAT_ID || "Auto"}\`\`\`\n\n` +
                          `1️⃣ *Kirim / Reply Chat Teks:*\n   \`\`\`${prefix}kimi <prompt>\`\`\` atau reply chat dengan \`\`\`${prefix}kimi\`\`\`\n` +
                          `2️⃣ *Kirim / Reply Media, Album & File:*\n   Kirim/Reply foto, video, dokumen, atau Album Media dengan \`\`\`${prefix}kimi <prompt>\`\`\`\n` +
                          `3️⃣ *Ganti Model:*\n   \`\`\`${prefix}kimimodel <instant|k2.8|k3.1>\`\`\`\n` +
                          `4️⃣ *List Obrolan (WITA):*\n   \`\`\`${prefix}kimilist\`\`\`\n` +
                          `5️⃣ *Ganti Nama Obrolan:*\n   \`\`\`${prefix}kimirename <nama baru>\`\`\`\n` +
                          `6️⃣ *Hapus Obrolan:*\n   \`\`\`${prefix}kimidel <id atau link obrolan>\`\`\``
                },
                { quoted: message }
            );
        }

        await setReaction(sock, remoteJid, message, "🔄");
        await ensureAuthenticatedSession(false);

        let prevUpdateTime = "";
        let prevMessageContent = "";
        if (CHAT_ID) {
            const initialFeeds = await fetchKimiListFeeds(15).catch(() => []);
            const currentChatFeed = initialFeeds.find(f => f.chat?.id === CHAT_ID)?.chat;
            if (currentChatFeed) {
                prevUpdateTime = currentChatFeed.updateTime || "";
                prevMessageContent = currentChatFeed.messageContent || "";
            }
        }

        let uploadedFileIds = [];
        if (attachments.length > 0) {
            uploadedFileIds = await uploadAttachmentsSequentiallyToKimi(attachments);
        }

        const messageBlocks = [];
        if (promptText || uploadedFileIds.length === 0) {
            messageBlocks.push({
                message_id: "",
                text: { content: promptText || "Jelaskan ini" }
            });
        }
        for (const fid of uploadedFileIds) {
            messageBlocks.push({
                file: {
                    id: fid,
                    status: "PROCESS_STATUS_SUCCESS"
                }
            });
        }

        const modelCfg = Object.values(MODEL_CONFIGS).find(m => m.id === ACTIVE_MODEL) || MODEL_CONFIGS["instant"];

        const sendChatStreamRequest = async (isRetry = false) => {
            if (isRetry) {
                await ensureAuthenticatedSession(true);
            }

            const chatRequestObj = {
                ...(CHAT_ID ? { chat_id: CHAT_ID } : {}),
                scenario: modelCfg.scenario,
                tools: modelCfg.tools,
                message: {
                    ...(lastParentMessageId ? { parent_id: lastParentMessageId } : {}),
                    role: "user",
                    blocks: messageBlocks,
                    scenario: modelCfg.scenario,
                    is_goal: false
                },
                options: modelCfg.options,
                project_id: ""
            };

            const framedBody = encodeConnectFrame(chatRequestObj);
            const chatHeaders = buildKimiHeaders(CHAT_ID, {
                "content-type": "application/connect+json"
            });

            const res = await kimiClient.post(
                "/apiv2/kimi.gateway.chat.v1.ChatService/Chat",
                framedBody,
                {
                    headers: chatHeaders,
                    responseType: "arraybuffer"
                }
            );

            const parsedEvents = parseConnectStreamBuffer(res.data);
            const hasAuthErrorEvent = parsedEvents.some(ev =>
                ev.error && /unauthenticated|unauthorized|expired|token/i.test(JSON.stringify(ev.error))
            );
            if (hasAuthErrorEvent && !isRetry) {
                return await sendChatStreamRequest(true);
            }

            return parsedEvents;
        };

        let events;
        try {
            events = await sendChatStreamRequest(false);
        } catch (chatErr) {
            if (chatErr?.response?.status === 401 || chatErr?.response?.status === 403) {
                events = await sendChatStreamRequest(true);
            } else {
                throw chatErr;
            }
        }

        const textBlocksById = new Map();
        const sandboxFileUris = new Set();

        for (const ev of events) {
            if (ev.chat?.id && !CHAT_ID) {
                CHAT_ID = ev.chat.id;
            }
            if (ev.message?.id && ev.message?.role !== "user") {
                lastParentMessageId = ev.message.id;
            } else if (ev.block?.messageId) {
                lastParentMessageId = ev.block.messageId;
            }

            if (ev.block?.text?.content !== undefined) {
                const bId = ev.block.id || "default";
                const prev = textBlocksById.get(bId) || "";
                if (ev.op === "append") {
                    textBlocksById.set(bId, prev + ev.block.text.content);
                } else if (ev.op === "set") {
                    textBlocksById.set(bId, ev.block.text.content);
                }
            } else if (Array.isArray(ev.message?.blocks) && ev.message?.role === "assistant") {
                ev.message.blocks.forEach((b, idx) => {
                    if (b.text?.content) {
                        textBlocksById.set(b.id || `msg_${idx}`, b.text.content);
                    }
                });
            }

            const rawEvStr = JSON.stringify(ev);
            const uriMatches = rawEvStr.match(/sandbox:\/\/\/[^\s"'\\}]+/g) || [];
            uriMatches.forEach(u => sandboxFileUris.add(u));
        }

        const orderedTextBlocks = Array.from(textBlocksById.values()).filter(t => t && t.trim().length > 0);
        const firstToolIntroBlock = orderedTextBlocks.length > 1 ? orderedTextBlocks[0].trim() : "";
        const lastStreamBlockText = orderedTextBlocks.length > 0 ? orderedTextBlocks[orderedTextBlocks.length - 1].trim() : "";

        // D. Sinkronisasi ListOutboxMessages & Ambil "messageContent" Terbaru dari ListFeeds
        if (CHAT_ID) {
            await kimiClient.post(
                "/apiv2/kimi.outbox.v1.OutboxService/ListOutboxMessages",
                { chat_id: CHAT_ID },
                { headers: buildKimiHeaders(CHAT_ID) }
            ).catch(() => {});
        }

        let latestMessageContent = "";
        for (let poll = 0; poll < 15; poll++) {
            const feeds = await fetchKimiListFeeds(15).catch(() => []);
            const targetFeed = CHAT_ID
                ? feeds.find(f => f.chat?.id === CHAT_ID)?.chat
                : feeds[0]?.chat;

            if (targetFeed) {
                if (!CHAT_ID && targetFeed.id) CHAT_ID = targetFeed.id;

                if (targetFeed.status === "STATUS_GENERATING") {
                    await sleep(2000);
                    continue;
                }

                if (targetFeed.messageContent) {
                    latestMessageContent = targetFeed.messageContent;
                    if (targetFeed.updateTime !== prevUpdateTime || latestMessageContent !== prevMessageContent) {
                        break;
                    }
                }
            }
            await sleep(1500);
        }

        let selectedRawText = latestMessageContent || lastStreamBlockText;
        if (
            latestMessageContent &&
            lastStreamBlockText &&
            lastStreamBlockText.length > latestMessageContent.length
        ) {
            selectedRawText = lastStreamBlockText;
        }

        const textUriMatches = selectedRawText.match(/sandbox:\/\/\/[^\s"'`)\]]+/g) || [];
        textUriMatches.forEach(u => sandboxFileUris.add(u));

        // Bersihkan sitasi pencarian (cite✦tools://...), tabel, HTML, dan format simbol (* dan ```)
        const cleanReply = cleanKimiMessageContent(selectedRawText, firstToolIntroBlock);

        // =================================================================
        // JIKA KIMI MENGHASILKAN FILE OUTPUT (ResolveFileURI)
        // Download & kirim sepaket (File + Caption ala button dengan * dan ```)
        // =================================================================
        if (sandboxFileUris.size > 0 && CHAT_ID) {
            await setReaction(sock, remoteJid, message, "⬇️");
            const resolvedFiles = [];

            for (const uri of sandboxFileUris) {
                const fileData = await resolveAndDownloadSandboxFile(CHAT_ID, uri).catch(() => null);
                if (fileData) resolvedFiles.push(fileData);
            }

            if (resolvedFiles.length > 0) {
                await setReaction(sock, remoteJid, message, "🔄");
                const fileButtonLabels = resolvedFiles.map(f => `*File*\n\`\`\`${f.fileName}\`\`\``).join("\n\n");
                const finalCaption = cleanReply
                    ? `${cleanReply}\n\n${fileButtonLabels}`
                    : fileButtonLabels;

                for (let i = 0; i < resolvedFiles.length; i++) {
                    const f = resolvedFiles[i];
                    await sock.sendMessage(
                        remoteJid,
                        {
                            document: f.buffer,
                            fileName: f.fileName,
                            mimetype: f.mimeType,
                            ...(i === 0 ? { caption: finalCaption } : {})
                        },
                        { quoted: message }
                    );
                }
                await setReaction(sock, remoteJid, message, "✅");
                return;
            }
        }

        if (!cleanReply) {
            throw new Error("Tidak ada balasan teks yang diterima dari Kimi AI.");
        }

        await sock.sendMessage(
            remoteJid,
            { text: cleanReply },
            { quoted: message }
        );
        await setReaction(sock, remoteJid, message, "✅");

    } catch (err) {
        let errDetail = err?.response?.data || err.message;
        if (Buffer.isBuffer(errDetail)) {
            errDetail = errDetail.toString("utf8");
        }
        console.error("Kimi AI Error:", errDetail);

        await setReaction(sock, remoteJid, message, "❌");

        if (err.message === "AUTHORIZATION_EMPTY" || err?.response?.status === 401) {
            return await sock.sendMessage(
                remoteJid,
                { text: "⚠️ *AUTHORIZATION* Kimi AI belum diisi atau sudah tidak valid. Silakan isi `AUTHORIZATION` di bagian atas kode sesuai akun Kimi masing-masing." },
                { quoted: message }
            );
        }

        await sock.sendMessage(
            remoteJid, {
                text: `⚠️ _Maaf, terjadi kesalahan saat memproses permintaan Kimi AI._\n\n💡 *Detail:* ${typeof errDetail === "object" ? JSON.stringify(errDetail) : errDetail}`
            },
            { quoted: message }
        );
    }
}

export default {
    handle,
    Commands: ["kimi", "kimiai", "kimimodel", "kimidel", "kimidelob", "kimirename", "kimilist", "kimiinfo"],
    OnlyPremium: false,
    OnlyOwner: false,
    limitDeduction: 1,
};
