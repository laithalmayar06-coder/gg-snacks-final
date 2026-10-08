// One-off tooling: node scripts/optimize-product-worlds.cjs <path-to-sharp-module>
// Sharp is a temporary build tool, not an application dependency.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(__dirname, '..');
const families = ['pop-g', 'trigger', 'loots', 'x-stix'];
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

(async () => {
  const report = [];
  for (const family of families) {
    const sourceDir = path.join(root, 'public/product-world', family);
    const outputDir = path.join(root, 'public/product-world/web', family);
    fs.mkdirSync(outputDir, { recursive: true });
    for (const file of fs.readdirSync(sourceDir).filter(name => name.endsWith('.png'))) {
      const original = fs.readFileSync(path.join(sourceDir, file));
      const metadata = await sharp(original).metadata();
      const pack = file === 'pack.png';
      const variants = pack ? ['desktop', 'mobile', 'thumb']
        : file === 'crumbs.png' || (family === 'x-stix' && file === 'sticks-main.png') ? ['desktop'] : ['desktop', 'mobile'];
      const entry = { source: `public/product-world/${family}/${file}`, bytes: original.length, width: metadata.width, height: metadata.height, sha256: hash(original), variants: [] };
      for (const variant of variants) {
        const size = pack ? { height: { desktop: 1440, mobile: 1120, thumb: 240 }[variant] }
          : { width: variant === 'mobile' ? 448 : 640 };
        const { data: pixels, info } = await sharp(original).resize({ ...size, withoutEnlargement: true, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const encoded = await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ lossless: true, effort: 6 }).toBuffer();
        const decoded = await sharp(encoded).ensureAlpha().raw().toBuffer();
        assert.equal(decoded.length, pixels.length);
        let transparentPixels = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          assert.equal(decoded[i + 3], pixels[i + 3], 'Alpha must be lossless');
          if (pixels[i + 3] === 0) { transparentPixels++; continue; }
          assert.equal(decoded[i], pixels[i]); assert.equal(decoded[i + 1], pixels[i + 1]); assert.equal(decoded[i + 2], pixels[i + 2]);
        }
        assert(info.width <= metadata.width && info.height <= metadata.height);
        assert(transparentPixels > 0, 'Transparency must remain present');
        const filename = `${path.basename(file, '.png')}-${variant}.webp`;
        fs.writeFileSync(path.join(outputDir, filename), encoded);
        entry.variants.push({ variant, path: `public/product-world/web/${family}/${filename}`, bytes: encoded.length, width: info.width, height: info.height, transparentPixels, losslessVisiblePixels: true });
      }
      assert.equal(hash(fs.readFileSync(path.join(sourceDir, file))), entry.sha256);
      report.push(entry);
      console.log(`${family}/${file}: ${entry.bytes} -> ${entry.variants.map(v => `${v.variant} ${v.bytes}`).join(', ')} bytes`);
    }
  }
  fs.writeFileSync(path.join(root, 'scripts/product-world-delivery-report.json'), JSON.stringify(report, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
