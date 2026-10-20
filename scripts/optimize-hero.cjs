// Delivery copies only. Usage: node scripts/optimize-hero.cjs <existing-sharp-module>
// Sharp is a build tool, not an application dependency. PNG masters are never written.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const specs = [
 ['hero bg.png', 'environment', [1672]],
 ['controller.png', 'controller', [640, 960, 1440, 1774]],
 ['chip 1.png', 'chip-one', [192, 320, 480, 640]],
 ['chip 2.png', 'chip-two', [192, 320, 480, 640]],
 ['popcorn 1.png', 'popcorn-one', [192, 320, 480, 640]],
 ['pop corn2.png', 'popcorn-two', [192, 320, 480, 640]],
 ['crumbs.png', 'crumbs', [128, 256, 384]],
];
(async () => {
 const report = { policy: 'Lossless WebP; visible RGB and alpha verified against Lanczos3 resized originals. Native background retained to protect portrait crop and dark gradients.', assets: [] };
 fs.mkdirSync(path.join(root, 'public/hero/web'), { recursive: true });
 for (const [name, id, widths] of specs) {
  const source = 'public/hero/' + name;
  const original = fs.readFileSync(path.join(root, source));
  const meta = await sharp(original).metadata();
  const entry = { source, id, originalBytes: original.length, width: meta.width, height: meta.height, originalSha256: hash(original), variants: [] };
  for (const width of widths) {
   const { data: pixels, info } = await sharp(original).resize({ width, withoutEnlargement: true, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
   const image = () => sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } });
   const lossless = await image().webp({ lossless: true, effort: 6 }).toBuffer();
   // Compare a high-quality background candidate, but ship lossless to guarantee the approved gradients.
   const comparison = id === 'environment' ? await image().webp({ quality: 98, effort: 6, smartSubsample: true }).toBuffer() : null;
   const decoded = await sharp(lossless).ensureAlpha().raw().toBuffer();
   assert.equal(decoded.length, pixels.length);
   let transparentPixels = 0;
   for (let i = 0; i < pixels.length; i += 4) {
    assert.equal(decoded[i + 3], pixels[i + 3], 'Alpha mismatch');
    if (!pixels[i + 3]) { transparentPixels++; continue; }
    for (let c = 0; c < 3; c++) assert.equal(decoded[i+c], pixels[i+c], 'Visible RGB mismatch');
   }
   assert(info.width <= meta.width && info.height <= meta.height);
   if (id !== 'environment') assert(transparentPixels > 0);
   const output = 'public/hero/web/' + id + '-' + info.width + '.webp';
   fs.writeFileSync(path.join(root, output), lossless);
   entry.variants.push({ output, width: info.width, height: info.height, bytes: lossless.length, sha256: hash(lossless), losslessVisibleRgb: true, identicalAlpha: true, transparentPixels, ...(comparison ? { quality98ComparisonBytes: comparison.length, selected: 'lossless: exact native visible pixels, no gradient compression' } : {}) });
  }
  assert.equal(hash(fs.readFileSync(path.join(root, source))), entry.originalSha256);
  report.assets.push(entry);
  console.log(name + ': ' + original.length + ' -> ' + entry.variants.map(v => v.width + 'w ' + v.bytes).join(', '));
 }
 report.originalTotalBytes = report.assets.reduce((sum, a) => sum + a.originalBytes, 0);
 fs.writeFileSync(path.join(root, 'scripts/hero-image-report.json'), JSON.stringify(report, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
