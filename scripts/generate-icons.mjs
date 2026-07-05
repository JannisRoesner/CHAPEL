#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'

const BG = [30, 41, 59]
const FG = [0, 193, 106]

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
  }
  return ~c >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

function isChurchPixel(x, y, size) {
  const s = size / 512
  const px = x / s
  const py = y / s

  const inRect = (x1, y1, x2, y2) => px >= x1 && px <= x2 && py >= y1 && py <= y2

  // Cross on steeple
  if (inRect(228, 96, 284, 152) || inRect(242, 82, 270, 166)) return true

  // Steeple roof
  if (inRect(214, 152, 298, 194)) return true

  // Main roof
  if (inRect(156, 194, 356, 236)) return true

  // Door opening
  if (inRect(228, 320, 284, 401)) return false

  // Walls
  if (inRect(172, 236, 340, 401)) return true

  return false
}

function createIconPng(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2

  const rows = []
  const cornerRadius = Math.round(size * 0.19)

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0
    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 3
      const inRoundedRect = isInsideRoundedRect(x, y, size, size, cornerRadius)
      if (!inRoundedRect) {
        row[idx] = 0
        row[idx + 1] = 0
        row[idx + 2] = 0
      } else if (isChurchPixel(x, y, size)) {
        row[idx] = FG[0]
        row[idx + 1] = FG[1]
        row[idx + 2] = FG[2]
      } else {
        row[idx] = BG[0]
        row[idx + 1] = BG[1]
        row[idx + 2] = BG[2]
      }
    }
    rows.push(row)
  }

  const raw = Buffer.concat(rows)
  const idat = deflateSync(raw)
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

function isInsideRoundedRect(x, y, w, h, r) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false
  if (x >= r && x < w - r) return true
  if (y >= r && y < h - r) return true
  const corners = [
    [r, r],
    [w - r - 1, r],
    [r, h - r - 1],
    [w - r - 1, h - r - 1]
  ]
  for (const [cx, cy] of corners) {
    const dx = x - cx
    const dy = y - cy
    if (dx * dx + dy * dy <= r * r) return true
  }
  return false
}

const dir = join(process.cwd(), 'public', 'icons')
await mkdir(dir, { recursive: true })
await writeFile(join(dir, 'icon-192.png'), createIconPng(192))
await writeFile(join(dir, 'icon-512.png'), createIconPng(512))
console.log('PWA icons created')
