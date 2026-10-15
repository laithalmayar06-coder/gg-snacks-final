// Delivery-only conversion; originals and native pixel dimensions are preserved.
// Usage: node scripts/optimize-digital-arena.cjs <existing-sharp-module>
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const sharp = require(process.argv[2] || 'sharp')
const root = path.resolve(__dirname, '..')
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
;(async () => {
 const report = []
 for (const source of ['desktop/neon_qr_portal_arena.png', 'mobile/neon_portal_arena_with_qr_hologram.png']) {
  const file = path.join(root, 'public/digital-arena', source)
  const original = fs.readFileSync(file)
  const metadata = await sharp(original).metadata()
  const pixels = await sharp(original).ensureAlpha().raw().toBuffer()
  const encoded = await sharp(original).webp({ lossless: true, effort: 6 }).toBuffer()
  const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer()
  assert.deepEqual(decoded, pixels, 'Native pixels and alpha must be identical')
  const delivery = source.replace(/\.png$/, '.webp')
  fs.writeFileSync(path.join(root, 'public/digital-arena', delivery), encoded)
  assert.equal(hash(fs.readFileSync(file)), hash(original))
  report.push({ source, delivery, width: metadata.width, height: metadata.height, sourceBytes: original.length, deliveryBytes: encoded.length, hasAlpha: metadata.hasAlpha, lossless: true, identicalDecodedRGBA: true, sourceSHA256: hash(original) })
 }
 fs.writeFileSync(path.join(root, 'scripts/digital-arena-report.json'), JSON.stringify(report, null, 2) + '\n')
 console.log(JSON.stringify(report, null, 2))
})().catch(error => { console.error(error); process.exitCode = 1 })
