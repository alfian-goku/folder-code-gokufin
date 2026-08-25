/*
Gemini AI Chat
Base : https://gemini.google.com
Feature :
  - Support chat (tentunya)
  - Support conversation
  - Support web search
  - Support Nano Banana text-to-image

Ambil cookie nya pake extensions J2teams Cookies > trus export file

Developer : ZennzXD
*/

const https = require('https')
const fs = require('fs')

const agent = new https.Agent({ keepAlive: true })

const randomUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random() * 16 | 0
  return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
})

function syncCookies(jar, setCookies = []) {
  const list = Array.isArray(setCookies) ? setCookies : [setCookies]
  for (const item of list) {
    const pair = item.split(';')[0].split('=')
    if (pair.length >= 2) {
      jar[pair[0].trim()] = pair.slice(1).join('=').trim()
    }
  }
}

const buildCookieString = (jar) => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')

function cleanText(text) {
  if (!text) return ''
  text = text.replace(/https?:\/\/[a-z0-9.-]*googleusercontent\.com\/[^\s\n"<>]+/gi, '')
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function request(url, { method = 'GET', headers = {}, body = null, stream = false } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: body ? { ...headers, 'content-length': Buffer.byteLength(body) } : headers,
      agent,
      maxHeaderSize: 1048576
    }

    const req = https.request(opts, res => {
      if (stream) return resolve({ res, headers: res.headers })
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ text: Buffer.concat(chunks).toString(), headers: res.headers }))
    })

    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function download(url, cookieStr = null, hops = 0) {
  return new Promise((resolve, reject) => {
    if (hops > 5) return reject(new Error('Too many redirects'))
    const safeUrl = url.startsWith('http:') ? url.replace('http:', 'https:') : url
    const u = new URL(safeUrl)
    const headers = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    if (cookieStr) headers['cookie'] = cookieStr
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers, maxHeaderSize: 1048576, agent }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        res.resume()
        return download(res.headers.location, cookieStr, hops + 1).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    }).on('error', reject)
  })
}

function parseFrames(buffer) {
  const frames = []
  let remaining = buffer

  if (remaining.startsWith(")]}'")) remaining = remaining.substring(4).trimStart()

  while (true) {
    const nl = remaining.indexOf('\n')
    if (nl === -1) break

    const sizeStr = remaining.substring(0, nl).trim()
    const size = parseInt(sizeStr, 10)

    if (isNaN(size)) {
      remaining = remaining.substring(nl + 1)
      continue
    }

    if (remaining.length < nl + size) break

    const framePayload = remaining.substring(nl, nl + size)
    remaining = remaining.substring(nl + size)

    try {
      const frameData = JSON.parse(framePayload)
      for (const item of (Array.isArray(frameData) ? frameData : [frameData])) {
        const innerStr = item?.[2]
        if (!innerStr) continue
        try { frames.push(JSON.parse(innerStr)) } catch (_) {}
      }
    } catch (_) {}
  }

  return { frames, remaining }
}

async function startSession(cookieStr = null) {
  const cookies = {}

  if (!cookieStr) {
    try {
      const fs = require('fs');
      if (fs.existsSync('cookies.json')) {
        const cookieData = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
        if (cookieData && Array.isArray(cookieData.cookies)) {
          cookieData.cookies.forEach(c => cookies[c.name] = c.value);
        }
      }
    } catch (err) {
      console.error('Failed to load cookies.json:', err.message);
    }
  } else {
    for (const pair of cookieStr.split(';')) {
      const idx = pair.indexOf('=')
      if (idx > 0) cookies[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim()
    }
  }

  const pageRes = await request('https://gemini.google.com/app', {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...(Object.keys(cookies).length > 0 ? { 'cookie': buildCookieString(cookies) } : {})
    }
  })
  syncCookies(cookies, pageRes.headers['set-cookie'])


  const cfb2hMatch = pageRes.text.match(/"cfb2h":\s*"(.*?)"/)
  const buildLabel = cfb2hMatch ? cfb2hMatch[1] : 'boq_assistant-bard-web-server_20260709.09_p0'

  const atMatch = pageRes.text.match(/"SNlM0e":"([^"]+)"/)
  const sidMatch = pageRes.text.match(/"FdrFJe":"(-?\d+)"/)
  const atToken = atMatch ? atMatch[1] : null
  const fSid = sidMatch ? sidMatch[1] : null

  const batchRes = await request('https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=en-US&_reqid=1&rt=c', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'cookie': buildCookieString(cookies)
    },
    body: 'f.req=[[["maGuAc","[0]",null,"generic"]]]&'
  })
  syncCookies(cookies, batchRes.headers['set-cookie'])

  const sessionId = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('')

  return {
    cookies,
    buildLabel,
    sessionId,
    atToken,
    fSid,
    reqId: Math.floor(Math.random() * 90000) + 10000
  }
}

function buildStreamRequest(prompt, tokens, metadata, auth, imageParam = null) {
  const traceId = randomUUID().toUpperCase()
  const queryParams = new URLSearchParams({ hl: 'en-US', _reqid: String(auth.reqId), rt: 'c' })
  if (auth.buildLabel) queryParams.set('bl', auth.buildLabel)
  if (auth.fSid) queryParams.set('f.sid', auth.fSid)
  else if (auth.sessionId) queryParams.set('f.sid', auth.sessionId)

  const payload = [
    [prompt, 0, null, imageParam, null, null, 0], ['en-US'],
    metadata, null, null, null, [1], 1, null, null, 1, 0, null, null, null, null, null, [[0]], 1,
    null, null, null, null, null,
    ['', '', '', null, null, null, null, null, 0, null, 1, null, null, null, []],
    null, null, 1, null, null, null, null, null, null, null,
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    1, null, null, null, null, [1]
  ]

  const bodyParams = new URLSearchParams({ 'f.req': JSON.stringify([null, JSON.stringify(payload)]) })
  if (auth.atToken) bodyParams.set('at', auth.atToken)
  const body = bodyParams.toString()

  return {
    url: `https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?${queryParams}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-goog-ext-525001261-jspb': '[1,null,null,null,"fbb127bbb056c959",null,null,0,[4,6],null,null,1,null,null,1]',
      'x-goog-ext-525005358-jspb': `["${traceId}",1]`,
      'x-goog-ext-73010989-jspb': '[0]',
      'x-goog-ext-73010990-jspb': '[0,0,0]',
      'x-same-domain': '1',
      'origin': 'https://gemini.google.com',
      'referer': 'https://gemini.google.com/',
      'cookie': buildCookieString(auth.cookies)
    },
    body
  }
}

async function chat(prompt, auth = null, chatId = null, onChunk = null) {
  auth = auth || await startSession()
  auth.reqId = (auth.reqId || 10000) + 100000

  let metadata = ['', '', '', null, null, null, null, null, null, '']
  if (chatId) {
    try {
      metadata = typeof chatId === 'string' ? JSON.parse(chatId) : chatId
    } catch (_) {}
  }

  const req = buildStreamRequest(prompt, null, metadata, auth)
  const { res, headers: resHeaders } = await request(req.url, { method: 'POST', headers: req.headers, body: req.body, stream: true })

  syncCookies(auth.cookies, resHeaders['set-cookie'])

  return new Promise((resolve, reject) => {
    let accumulatedText = ''
    let lastSentText = ''
    let buf = ''
    let updatedMetadata = metadata

    res.on('data', chunk => {
      try {
        buf += chunk.toString('utf8')
        const { frames, remaining } = parseFrames(buf)
        buf = remaining

        for (const pj of frames) {
          if (pj?.[1]) updatedMetadata = pj[1]
          if (typeof pj?.[25] === 'string') updatedMetadata[9] = pj[25]
          for (const cand of (pj?.[4] || [])) {
            const cleaned = cleanText(cand?.[1]?.[0] || '')
            if (cleaned) {
              accumulatedText = cleaned
              const delta = cleaned.substring(lastSentText.length)
              if (delta && onChunk) {
                onChunk(delta)
                lastSentText = cleaned
              }
            }
          }
        }
      } catch (err) { reject(err) }
    })

    res.on('end', () => {
      const finalDelta = accumulatedText.substring(lastSentText.length)
      if (finalDelta && onChunk) onChunk(finalDelta)
      resolve({ reply: accumulatedText, chatId: updatedMetadata, auth })
    })

    res.on('error', reject)
  })
}

async function uploadImage(filePath) {
  const fileData = fs.readFileSync(filePath)
  const fileName = filePath.split('/').pop()
  
  const startHeaders = {
    'host': 'push.clients6.google.com',
    'x-goog-upload-protocol': 'resumable',
    'x-goog-upload-command': 'start',
    'x-goog-upload-header-content-length': String(fileData.length),
    'push-id': 'feeds/mcudyrk2a4khkz',
    'x-client-pctx': 'CgcSBWjK7pYx',
    'x-tenant-id': 'bard-storage',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'origin': 'https://gemini.google.com',
    'referer': 'https://gemini.google.com/',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  const startRes = await request('https://push.clients6.google.com/upload/', { method: 'POST', headers: startHeaders, body: `File name: ${fileName}` })
  const uploadUrl = startRes.headers['x-goog-upload-url']
  
  const uploadHeaders = {
    'host': 'push.clients6.google.com',
    'x-goog-upload-command': 'upload, finalize',
    'x-goog-upload-offset': '0',
    'x-tenant-id': 'bard-storage',
    'push-id': 'feeds/mcudyrk2a4khkz',
    'x-client-pctx': 'CgcSBWjK7pYx',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'origin': 'https://gemini.google.com',
    'referer': 'https://gemini.google.com/',
    'content-length': String(fileData.length)
  }
  const uploadRes = await request(uploadUrl, { method: 'POST', headers: uploadHeaders, body: fileData })
  return uploadRes.text.trim()
}

async function generateImageToImage(prompt, imagePath, auth = null, chatId = null, outputPath = 'output.png') {
  auth = auth || await startSession()
  auth.reqId = (auth.reqId || 10000) + 100000

  const imgUrl = await uploadImage(imagePath)
  const imageParam = [
    [[imgUrl, 1], imagePath.split('/').pop()]
  ]

  let metadata = ['', '', '', null, null, null, null, null, null, '']
  if (chatId) {
    try {
      metadata = typeof chatId === 'string' ? JSON.parse(chatId) : chatId
    } catch (_) {}
  }

  const req = buildStreamRequest(prompt, null, metadata, auth, imageParam)
  const { res, headers: resHeaders } = await request(req.url, { method: 'POST', headers: req.headers, body: req.body, stream: true })

  syncCookies(auth.cookies, resHeaders['set-cookie'])

  return new Promise((resolve, reject) => {
    let rawText = ''
    let fullRawText = ''
    let buf = ''
    let updatedMetadata = metadata

    res.on('data', chunk => {
      try {
        const chunkStr = chunk.toString('utf8')
        fullRawText += chunkStr
        buf += chunkStr
        const { frames, remaining } = parseFrames(buf)
        buf = remaining

        for (const pj of frames) {
          if (pj?.[1]) updatedMetadata = pj[1]
          if (typeof pj?.[25] === 'string') updatedMetadata[9] = pj[25]
          for (const cand of (pj?.[4] || [])) {
            const raw = cand?.[1]?.[0] || ''
            if (raw) rawText += raw
          }
        }
      } catch (err) { reject(err) }
    })

    res.on('end', async () => {
      try {
        const urlMatch = fullRawText.match(/https?:\/\/[a-z0-9.-]*googleusercontent\.com\/(?:rd-)?gg-dl\/[^\s\n"<>'\\]+/i)
        if (!urlMatch) {
          return resolve({ imageUrl: null, reply: cleanText(rawText), chatId: updatedMetadata, auth })
        }

        const imageUrl = urlMatch[0]
        const imgBuf = await download(imageUrl, buildCookieString(auth.cookies))
        fs.writeFileSync(outputPath, imgBuf)
        resolve({ imageUrl, savedTo: outputPath, chatId: updatedMetadata, auth })
      } catch (err) { reject(err) }
    })

    res.on('error', reject)
  })
}

async function generateImage(prompt, auth = null, chatId = null, outputPath = 'output.png') {
  auth = auth || await startSession()
  auth.reqId = (auth.reqId || 10000) + 100000

  let metadata = ['', '', '', null, null, null, null, null, null, '']
  if (chatId) {
    try {
      metadata = typeof chatId === 'string' ? JSON.parse(chatId) : chatId
    } catch (_) {}
  }

  const req = buildStreamRequest(prompt, null, metadata, auth)
  const { res, headers: resHeaders } = await request(req.url, { method: 'POST', headers: req.headers, body: req.body, stream: true })

  syncCookies(auth.cookies, resHeaders['set-cookie'])

  return new Promise((resolve, reject) => {
    let rawText = ''
    let fullRawText = ''
    let buf = ''
    let updatedMetadata = metadata

    res.on('data', chunk => {
      try {
        const chunkStr = chunk.toString('utf8')
        fullRawText += chunkStr
        buf += chunkStr
        const { frames, remaining } = parseFrames(buf)
        buf = remaining

        for (const pj of frames) {
          if (pj?.[1]) updatedMetadata = pj[1]
          if (typeof pj?.[25] === 'string') updatedMetadata[9] = pj[25]
          for (const cand of (pj?.[4] || [])) {
            const raw = cand?.[1]?.[0] || ''
            if (raw) rawText += raw
          }

        }
      } catch (err) { reject(err) }
    })

    res.on('end', async () => {
      try {
        const urlMatch = fullRawText.match(/https?:\/\/[a-z0-9.-]*googleusercontent\.com\/(?:rd-)?gg-dl\/[^\s\n"<>'\\]+/i)
        if (!urlMatch) {
          return resolve({ imageUrl: null, reply: cleanText(rawText), chatId: updatedMetadata, auth })
        }

        const imageUrl = urlMatch[0]
        const imgBuf = await download(imageUrl, buildCookieString(auth.cookies))
        fs.writeFileSync(outputPath, imgBuf)
        resolve({ imageUrl, savedTo: outputPath, chatId: updatedMetadata, auth })
      } catch (err) { reject(err) }
    })

    res.on('error', reject)
  })
}

async function run() {
  try {
    const auth = await startSession()
    console.log('\nSession:', auth.buildLabel)
    
    console.log('\n--- Chat Biasa ---')
    const res1 = await chat('hai kenalin namaku zen', auth, null, chunk => process.stdout.write(chunk))
    console.log()

    console.log('\n--- Lanjut Percakapan ---')
    const res2 = await chat('namaku siapa?', res1.auth, res1.chatId, chunk => process.stdout.write(chunk))
    console.log()

    console.log('\n--- Web Search ---')
    const res3 = await chat('berita populer indonesia hari ini', res2.auth, res2.chatId, chunk => process.stdout.write(chunk))
    console.log()

    console.log('\n--- Text to Image ---')
    const img = await generateImage('cyberpunk car 4k', auth)
    if (img.savedTo) {
      console.log('Saved:', img.savedTo)
      console.log('URL:', img.imageUrl)
    }

    console.log('\n--- Image to Image ---')
    try {
      const img2img = await generateImageToImage('make it look cyberpunk', '/home/zenz/IMG-20260812-WA0064.jpg', auth, null, 'output_img2img.png')
      if (img2img.savedTo) {
        console.log('Saved:', img2img.savedTo)
        console.log('URL:', img2img.imageUrl)
      }
    } catch (err) {
      console.log('Error i2i:', err.message)
    }
  } catch (err) {
    console.error(err)
  }
}

if (require.main === module) {
  run()
}

module.exports = { startSession, chat, generateImage, generateImageToImage, buildCookieString, uploadImage }