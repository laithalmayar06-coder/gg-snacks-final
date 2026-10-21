const assert = require('node:assert/strict')
const fs = require('node:fs')
const crypto = require('node:crypto')
const ts = require('typescript')
const report = require('../scripts/find-contact-image-report.json')
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const compileData = file => {
  const module = { exports: {} }
  new Function('module', 'exports', ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(module, module.exports)
  return module.exports
}
const find = compileData('src/data/homepageFindGG.ts').homepageFindGGAssets
const contact = compileData('src/data/homepageContact.ts').homepageContactAssets
const references = [...Object.values(find), ...Object.values(contact)]
function webpDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF')
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP')
  for (let i = 12; i + 8 <= buffer.length;) {
    const type = buffer.toString('ascii', i, i + 4), size = buffer.readUInt32LE(i + 4), start = i + 8
    if (type === 'VP8X') return [1 + buffer.readUIntLE(start + 4, 3), 1 + buffer.readUIntLE(start + 7, 3)]
    if (type === 'VP8L') { assert.equal(buffer[start], 0x2f); const bits = buffer.readUInt32LE(start + 1); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1] }
    if (type === 'VP8 ') return [buffer.readUInt16LE(start + 6) & 0x3fff, buffer.readUInt16LE(start + 8) & 0x3fff]
    i = start + size + (size % 2)
  }
  throw Error('Missing WebP image chunk')
}
async function main() {
  // No runtime codec dependency. Optionally pass existing Sharp for independent pixel revalidation.
  const sharp = process.argv[2] ? require(process.argv[2]) : null
  assert.equal(report.assets.length, 12)
  assert.equal(report.assets.filter(a => a.lossless).length, 6)
  assert.equal(new Set(references.map(a => a.src)).size, 12)
  for (const asset of report.assets) {
    const original = fs.readFileSync(asset.source), delivered = fs.readFileSync(asset.output)
    assert.equal(original.length, asset.originalBytes)
    assert.equal(hash(original), asset.originalSha256, 'Master changed: ' + asset.source)
    assert.equal(delivered.length, asset.deliveryBytes)
    assert.equal(hash(delivered), asset.deliverySha256, 'Delivery changed: ' + asset.output)
    const reference = references.find(a => 'public' + decodeURIComponent(a.src) === asset.output)
    assert.ok(reference, 'Delivery not referenced: ' + asset.output)
    assert.ok(reference.src.startsWith('/section%20'), 'Spaces must stay URL encoded')
    assert.equal(reference.width, asset.width)
    assert.equal(reference.height, asset.height)
    const dimensions = asset.output.endsWith('.png') ? [delivered.readUInt32BE(16), delivered.readUInt32BE(20)] : webpDimensions(delivered)
    assert.deepEqual(dimensions, [asset.width, asset.height])
    if (!asset.lossless) { assert.equal(asset.source, asset.output); continue }
    assert.equal(asset.alphaDifferences, 0)
    assert.equal(asset.visibleRgbDifferences, 0)
    assert.ok(asset.hasAlpha)
    assert.ok(asset.deliveryBytes < asset.originalBytes * .95)
    assert.ok(delivered.includes(Buffer.from('VP8L')), 'Must contain lossless image stream')
    assert.deepEqual([original.readUInt32BE(16), original.readUInt32BE(20)], dimensions, 'No resizing/cropping')
    if (sharp) {
      const a = await sharp(original).ensureAlpha().raw().toBuffer(), b = await sharp(delivered).ensureAlpha().raw().toBuffer()
      assert.equal(a.length, b.length)
      for (let i = 0; i < a.length; i += 4) {
        assert.equal(a[i + 3], b[i + 3], 'Alpha must be exact')
        if (!a[i + 3]) { a.fill(0, i, i + 3); b.fill(0, i, i + 3) }
      }
      assert.ok(a.equals(b), 'Visible RGBA must be exact: ' + asset.source)
      assert.equal(hash(a), asset.visibleRgbaSha256)
    }
  }
  const footer = fs.readFileSync('src/components/HomepageFooter.tsx', 'utf8')
  const form = fs.readFileSync('src/components/HomepageContact.tsx', 'utf8')
  assert.ok(form.includes('homepageContactAssets as art'))
  for (const key of ['background', 'fog', 'halo', 'platform']) {
    assert.ok(footer.includes('...homepageContactAssets.' + key), 'Footer shares ' + key)
    assert.ok(form.includes('...art.' + key), 'Contact shares ' + key)
  }
  const mapCss = fs.readFileSync('src/styles/homepage-find-gg.css', 'utf8')
  assert.match(mapCss, /aspect-ratio: 883 \/ 650/)
  for (const [name, left, top] of [['central',40,24],['east',68,49],['distant',72,30]]) {
    assert.match(mapCss, new RegExp('home-find-pin--' + name + ' \\{ left: ' + left + '%; top: ' + top + '%;'), 'Approved pin coordinates')
  }
  const footerCss = fs.readFileSync('src/styles/homepage-footer.css', 'utf8')
  assert.match(footerCss, /inset: -72px 0 0/)
  assert.match(footerCss, /transparent 0,#000 72px/)
  const original = report.assets.reduce((n,a) => n + a.originalBytes, 0), delivery = report.assets.reduce((n,a) => n + a.deliveryBytes, 0)
  assert.equal(report.totals.originalBytes, original)
  assert.equal(report.totals.deliveryBytes, delivery)
  assert.equal(report.totals.savedBytes, original - delivery)
  assert.deepEqual(report.viewportDelivery.map(v => v.width), [320,375,390,430,768,1024,1440,1920])
  assert.ok(report.viewportDelivery.every(v => v.uniqueImageBytes === delivery))
  console.log('Find/Contact delivery: 12 references, six native lossless WebPs, master/delivery hashes and dimensions, shared Footer URLs, approved map coordinates and 72px overlap passed.' + (sharp ? ' Independent visible RGBA/alpha decode comparison passed.' : ' Pixel comparisons are recorded by the hash-verified generation report.'))
  console.log('Native-size delivery is identical at all eight requested widths. Browser layout/network measurements are not simulated by this test.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
