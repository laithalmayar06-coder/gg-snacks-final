// One-off tooling; reuse an external Sharp installation without adding an app dependency.
// node scripts/optimize-product-world-core.cjs <path-to-sharp-module>
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(__dirname, '..');
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
(async () => {
  const report = [];
  for (const name of ['world-bg', 'hologram-neutral']) {
    const source = 'public/product-world/core/' + name + '.png';
    const output = 'public/product-world/core/' + name + '.webp';
    const original = fs.readFileSync(path.join(root, source));
    const metadata = await sharp(original).metadata();
    const { data: pixels, info } = await sharp(original).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const encoded = await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ lossless: true, effort: 6 }).toBuffer();
    const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(decoded.info.width, metadata.width);
    assert.equal(decoded.info.height, metadata.height);
    assert.equal(decoded.data.length, pixels.length);
    let transparentPixels = 0, alphaDifferences = 0, visibleRgbDifferences = 0, transparentRgbDifferences = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] !== decoded.data[i + 3]) alphaDifferences++;
      if (pixels[i + 3] === 0) transparentPixels++;
      for (let c = 0; c < 3; c++) if (pixels[i + c] !== decoded.data[i + c]) {
        if (pixels[i + 3] === 0) transparentRgbDifferences++; else visibleRgbDifferences++;
      }
    }
    assert.equal(alphaDifferences, 0, 'Alpha must match exactly');
    assert.equal(visibleRgbDifferences, 0, 'All visible pixels must match exactly');
    const saving = 1 - encoded.length / original.length;
    const used = saving >= .05;
    if (used) fs.writeFileSync(path.join(root, output), encoded);
    assert.equal(hash(fs.readFileSync(path.join(root, source))), hash(original), 'Original PNG must remain untouched');
    report.push({ source, output: used ? output : null, width: info.width, height: info.height, sourceBytes: original.length, webpBytes: encoded.length, savingPercent: +(saving * 100).toFixed(2), used, originalSha256: hash(original), webpSha256: hash(encoded), sourceHasAlpha: metadata.hasAlpha, sourceHasProfile: metadata.hasProfile, transparentPixels, alphaDifferences, visibleRgbDifferences, transparentRgbDifferences });
  }
  fs.writeFileSync(path.join(root, 'scripts/product-world-core-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
