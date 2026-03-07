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

    return res.data?.files?.[0]?.url