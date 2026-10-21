// Offline delivery tooling. Reuse an existing Sharp installation; no app dependency.
// node scripts/optimize-find-contact.cjs <path-to-sharp-module>
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const assert = require('node:assert/strict')
const sharp = require(process.argv[2] || 'sharp')
const root = path.resolve(__dirname, '..')
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex')
const groups = {
  'section 6': ['find-gg-cinematic-background.webp', 'find-gg-saudi-map.png', 'find-gg-clean-fog.png', 'pin-blue.png', 'pin-purple.png', 'ripple-blue.png', 'ripple-purple.png'],
  'section 7': ['contact-signal-background.webp', 'contact-fog-overlay.png', 'contact-neon-platform.png', 'contact-signal-halo.png', 'contact-hologram-envelopes.png'],
}
const candidates = new Set(['find-gg-saudi-map.png', 'find-gg-clean-fog.png', 'contact-fog-overlay.png', 'contact-neon-platform.png', 'contact-signal-halo.png', 'contact-hologram-envelopes.png'])
async function main() {
  const assets = [], writes = []
  for (const [folder, names] of Object.entries(groups)) for (const name of names) {
    const source = 'public/' + folder + '/' + name
    const original = fs.readFileSync(path.join(root, source))
    const meta = await sharp(original).metadata()
    const entry = { source, width: meta.width, height: meta.height, hasAlpha: meta.hasAlpha, hasProfile: !!meta.hasProfile, originalBytes: original.length, originalSha256: hash(original) }
    if (candidates.has(name)) {
      const encoded = await sharp(original).webp({ lossless: true, effort: 6 }).toBuffer()
      const before = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const after = await sharp(encoded).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.equal(after.info.width, before.info.width)
      assert.equal(after.info.height, before.info.height)
      assert.equal(after.data.length, before.data.length)
      assert.equal((await sharp(encoded).metadata()).hasAlpha, meta.hasAlpha)
      let alphaDifferences = 0, visibleRgbDifferences = 0, transparentRgbDifferences = 0
      for (let i = 0; i < before.data.length; i += 4) {
        if (before.data[i + 3] !== after.data[i + 3]) alphaDifferences++
        for (let c = 0; c < 3; c++) if (before.data[i + c] !== after.data[i + c]) {
          if (before.data[i + 3]) visibleRgbDifferences++; else transparentRgbDifferences++
        }
        // Fully transparent RGB has no visual contribution. Canonicalize only for comparison.
        if (!before.data[i + 3]) before.data.fill(0, i, i + 3)
        if (!after.data[i + 3]) after.data.fill(0, i, i + 3)
      }
      assert.equal(alphaDifferences, 0, source + ': alpha changed')
      assert.equal(visibleRgbDifferences, 0, source + ': visible RGB changed')
      assert.ok(before.data.equals(after.data), source + ': visible pixels changed')
      assert.ok(encoded.length < original.length * .95, source + ': insufficient savings')
      const output = 'public/' + folder + '/web/' + name.replace(/\.png$/, '.webp')
      Object.assign(entry, { output, deliveryBytes: encoded.length, deliverySha256: hash(encoded), savingsPercent: +(100 * (1 - encoded.length / original.length)).toFixed(2), lossless: true, alphaDifferences, visibleRgbDifferences, transparentRgbDifferences, visibleRgbaSha256: hash(before.data) })
      writes.push({ output, encoded })
    } else Object.assign(entry, { output: source, deliveryBytes: original.length, deliverySha256: hash(original), savingsPercent: 0 })
    assert.equal(hash(fs.readFileSync(path.join(root, source))), entry.originalSha256, 'Master changed')
    assets.push(entry)
  }
  for (const { output, encoded } of writes) {
    fs.mkdirSync(path.dirname(path.join(root, output)), { recursive: true })
    fs.writeFileSync(path.join(root, output), encoded)
  }
  const originalBytes = assets.reduce((sum, a) => sum + a.originalBytes, 0)
  const deliveryBytes = assets.reduce((sum, a) => sum + a.deliveryBytes, 0)
  const report = {
    strategy: 'Native dimensions, lossless WebP; unchanged backgrounds/pins/ripples. Contact/Footer share URLs. No responsive downscaling or extra preloads.',
    sharpVersion: sharp.versions.sharp,
    assets,
    totals: { originalBytes, deliveryBytes, savedBytes: originalBytes - deliveryBytes, savingsPercent: +(100 * (1 - deliveryBytes / originalBytes)).toFixed(2) },
    viewportDelivery: [320, 375, 390, 430, 768, 1024, 1440, 1920].map(width => ({ width, uniqueImageBytes: deliveryBytes })),
    measurementNote: 'File byte totals for these 12 unique images once loaded, not measured network transfers; Contact/Footer reuse is counted once. Official logo and other sections excluded.'
  }
  fs.writeFileSync(path.join(root, 'scripts/find-contact-image-report.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report.totals))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
