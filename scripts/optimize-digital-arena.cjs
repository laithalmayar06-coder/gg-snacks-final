// Local high-fidelity candidates only. Never overwrite PNG masters or lossless WebPs.
// node scripts/optimize-digital-arena.cjs <existing-sharp-module> [comparison-directory]
// Comparison artifacts default to a temporary directory outside public/ and are not shipped.
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const sharp = require(process.argv[2] || 'sharp')
const root = path.resolve(__dirname, '..')
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const file = relative => path.join(root, 'public/digital-arena', relative)
const reportFile = path.join(root, 'scripts/digital-arena-report.json')
const label = (text, width) => Buffer.from('<svg width="' + width + '" height="42"><rect width="100%" height="100%" fill="#101726"/><text x="12" y="27" fill="white" font-family="Arial" font-size="15">' + text + '</text></svg>')
async function sheet(filename, rows, width) {
 const layers = []; let top = 0
 for (const row of rows) {
  let height = 0
  for (let c = 0; c < row.length; c++) {
   const { image, title } = row[c], meta = await sharp(image).metadata()
   layers.push({ input: label(title, width), left: c * width, top })
   layers.push({ input: image, left: c * width, top: top + 42 })
   height = Math.max(height, meta.height)
  }
  top += height + 54
 }
 await sharp({ create: { width: width * 3, height: top, channels: 3, background: '#06080e' } }).composite(layers).png().toFile(filename)
}
async function main() {
 const comparisons = process.argv[3] ? path.resolve(process.argv[3]) : fs.mkdtempSync(path.join(os.tmpdir(), 'gg-arena-quality-'))
 assert.ok(!comparisons.startsWith(path.join(root, 'public') + path.sep), 'Review sheets must not be public assets')
 fs.mkdirSync(comparisons, { recursive: true })
 const report = []
 for (const previous of JSON.parse(fs.readFileSync(reportFile, 'utf8'))) {
  const { source, delivery, width, height, sourceBytes, deliveryBytes, hasAlpha, lossless, identicalDecodedRGBA, sourceSHA256 } = previous
  const entry = { source, delivery, width, height, sourceBytes, deliveryBytes, hasAlpha, lossless, identicalDecodedRGBA, sourceSHA256 }
  const original = fs.readFileSync(file(source)), approved = fs.readFileSync(file(delivery))
  assert.equal(hash(original), sourceSHA256, 'Master differs from approved report')
  assert.equal(original.length, sourceBytes)
  assert.equal(approved.length, deliveryBytes)
  const baseline = await sharp(approved).ensureAlpha().raw().toBuffer()
  assert.ok(baseline.equals(await sharp(original).ensureAlpha().raw().toBuffer()), 'Lossless baseline must equal PNG')
  entry.deliverySHA256 = hash(approved)
  entry.candidates = []
  const images = [approved], decoded = [baseline]
  for (const quality of [98, 95]) {
   const encoded = await sharp(original).webp({ quality, effort: 6 }).toBuffer()
   const meta = await sharp(encoded).metadata()
   assert.equal(meta.width, width); assert.equal(meta.height, height); assert.equal(meta.hasAlpha, hasAlpha)
   const pixels = await sharp(encoded).ensureAlpha().raw().toBuffer()
   assert.equal(pixels.length, baseline.length)
   let squared = 0, absolute = 0, maxError = 0, alphaDifferences = 0
   for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] !== baseline[i + 3]) alphaDifferences++
    for (let c = 0; c < 3; c++) { const delta = Math.abs(pixels[i + c] - baseline[i + c]); squared += delta * delta; absolute += delta; maxError = Math.max(maxError, delta) }
   }
   assert.equal(alphaDifferences, 0)
   assert.ok(encoded.length < approved.length)
   const output = source.replace(/\.png$/, '-v1-q' + quality + '.webp')
   assert.notEqual(output, source); assert.notEqual(output, delivery)
   // A versioned candidate may be rerun only if its bytes are identical.
   if (fs.existsSync(file(output))) assert.ok(fs.readFileSync(file(output)).equals(encoded), 'Use a new version for changed encoding')
   else fs.writeFileSync(file(output), encoded)
   entry.candidates.push({ quality, delivery: output, width, height, hasAlpha: meta.hasAlpha, lossless: false, bytes: encoded.length, sha256: hash(encoded), savingsPercent: +(100 * (1 - encoded.length / approved.length)).toFixed(2), alphaDifferences, meanAbsoluteRgbError: +(absolute / (width * height * 3)).toFixed(4), psnrRgb: +(10 * Math.log10(255 * 255 / (squared / (width * height * 3)))).toFixed(3), maxRgbError: maxError })
   images.push(encoded); decoded.push(pixels)
  }
  const kind = width > height ? 'desktop' : 'mobile'
  const overviewWidth = kind === 'desktop' ? 768 : 384
  await sheet(path.join(comparisons, kind + '-overview.png'), [await Promise.all(images.map(async (image, i) => ({ title: ['Approved lossless', 'Q98 candidate', 'Q95 candidate'][i], image: await sharp(image).resize({ width: overviewWidth }).png().toBuffer() })))], overviewWidth)
  const crops = kind === 'desktop' ? [{ name: 'QR and neon', left: 1000, top: 270 }, { name: 'Architecture and fog', left: 1190, top: 515 }, { name: 'Dark texture', left: 250, top: 370 }] : [{ name: 'QR and neon', left: 435, top: 925 }, { name: 'Architecture and fog', left: 430, top: 1240 }, { name: 'Dark gradient', left: 280, top: 210 }]
  const detailRows = []
  for (const crop of crops) detailRows.push(await Promise.all(images.map(async (image, i) => ({ title: crop.name + ' - ' + ['lossless', 'Q98', 'Q95'][i] + ' (1:1)', image: await sharp(image).extract({ left: crop.left, top: crop.top, width: 384, height: 256 }).png().toBuffer() }))))
  await sheet(path.join(comparisons, kind + '-details-100pct.png'), detailRows, 384)
  const diagnosticRows = []
  for (const crop of crops.slice(0, 2)) {
   const row = [{ title: crop.name + ' - approved (1:1)', image: await sharp(approved).extract({ left: crop.left, top: crop.top, width: 384, height: 256 }).png().toBuffer() }]
   for (let n = 1; n <= 2; n++) {
    const diff = Buffer.alloc(width * height * 3)
    for (let i = 0, j = 0; i < baseline.length; i += 4) for (let c = 0; c < 3; c++) diff[j++] = Math.min(255, 8 * Math.abs(baseline[i + c] - decoded[n][i + c]))
    row.push({ title: 'Diagnostic only: Q' + (n === 1 ? 98 : 95) + ' error x8', image: await sharp(diff, { raw: { width, height, channels: 3 } }).extract({ left: crop.left, top: crop.top, width: 384, height: 256 }).png().toBuffer() })
   }
   diagnosticRows.push(row)
  }
  await sheet(path.join(comparisons, kind + '-diagnostic-difference-x8.png'), diagnosticRows, 384)
  entry.comparisonNote = 'Lossy pixel metrics and amplified differences are diagnostic, not proof of visual equivalence. Human approval required. PNG and lossless rollback sources remain intact.'
  assert.equal(hash(fs.readFileSync(file(source))), sourceSHA256)
  assert.equal(hash(fs.readFileSync(file(delivery))), entry.deliverySHA256)
  report.push(entry)
 }
 fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n')
 console.log(JSON.stringify({ comparisons, assets: report.map(a => ({ source: a.source, candidates: a.candidates })) }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
