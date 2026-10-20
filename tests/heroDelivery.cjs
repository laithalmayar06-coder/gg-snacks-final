const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
 const source = fs.readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})');
 module._compile(ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText, filename);
};
require.extensions['.css'] = () => {};
const React = require('react'), {renderToString} = require('react-dom/server');
const {LanguageProvider} = require('../src/i18n/LanguageContext.tsx');
const Hero = require('../src/components/Hero.tsx').default;
const {heroLayers, heroBackground, getHeroDelivery, heroHiddenSource, HERO_MOBILE_MEDIA} = require('../src/data/heroLayers.ts');
const report = JSON.parse(fs.readFileSync(root + '/scripts/hero-image-report.json'));
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
assert.equal(report.originalTotalBytes, 8783659);
const deliveries = new Map();
for (const asset of report.assets) {
 const original = fs.readFileSync(root + '/' + asset.source);
 assert.equal(original.length, asset.originalBytes); assert.equal(hash(original), asset.originalSha256);
 for (const v of asset.variants) {
  const bytes = fs.readFileSync(root + '/' + v.output);
  assert.equal(bytes.length, v.bytes); assert.equal(hash(bytes), v.sha256);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert(v.identicalAlpha && v.losslessVisibleRgb);
  assert(v.width <= asset.width && v.height <= asset.height);
  assert(Math.abs(v.width / v.height - asset.width / asset.height) < .002);
  if (asset.id !== 'environment') assert(v.transparentPixels > 0);
  assert(v.bytes < asset.originalBytes);
  deliveries.set('/' + v.output.replace(/^public\//, ''), v);
 }
}
assert(deliveries.has(heroBackground));
assert.equal(HERO_MOBILE_MEDIA, '(max-width: 767px)');
assert(heroHiddenSource.startsWith('data:image/gif;base64,'));
const pixel = Buffer.from(heroHiddenSource.split(',')[1], 'base64');
assert.equal(pixel.readUInt16LE(6), 1); assert.equal(pixel.readUInt16LE(8), 1);
const control = pixel.indexOf(Buffer.from([0x21,0xf9,0x04]));
assert(control >= 0 && (pixel[control + 3] & 1), 'The network-free source must explicitly preserve transparency');
// Evaluate the standards-based sizes expression; this is not a browser network measurement.
function slot(sizes, width, height) {
 let depth = 0, start = 0; const choices = [];
 for (let i = 0; i < sizes.length; i++) { if (sizes[i] === '(') depth++; if (sizes[i] === ')') depth--; if (sizes[i] === ',' && !depth) { choices.push(sizes.slice(start, i).trim()); start = i + 1; } }
 choices.push(sizes.slice(start).trim());
 for (let expression of choices) {
  const media = expression.match(/^\(max-width: (\d+)px\) /);
  if (media) { if (width > Number(media[1])) continue; expression = expression.slice(media[0].length); }
  expression = expression.replace(/([\d.]+)(vw|svh|px)/g, (_, n, unit) => String(Number(n) * (unit === 'vw' ? width / 100 : unit === 'svh' ? height / 100 : 1)));
  assert(/^[\d. ,()+*\-/a-z]+$/.test(expression));
  return Function('min', 'max', 'clamp', 'calc', 'return ' + expression)(Math.min, Math.max, (lo, n, hi) => Math.max(lo, Math.min(n, hi)), n => n);
 }
 throw Error('No matching sizes entry');
}
const fractions = {controller: .33, 'chip-one': .09, 'chip-two': .1, 'popcorn-one': .065, 'popcorn-two': .07, crumbs: .05};
const mobile = {controller: [.88,460], 'chip-one':[.21,110], 'chip-two':[.2,100], 'popcorn-one':[.16,85], 'popcorn-two':[.16,85]};
const viewports = [[320,700],[375,812],[390,844],[430,932],[767,900],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080]];
let cases = 0;
for (const [width,height] of viewports) for (const dpr of [1,2,3]) {
 for (const layer of heroLayers) {
  const delivery = getHeroDelivery(layer.id);
  assert(deliveries.has(delivery.src));
  const candidates = delivery.srcSet.split(', ').map(part => {const [url,w] = part.split(' '); assert(deliveries.has(url)); assert.equal(deliveries.get(url).width, parseInt(w)); return {url,width:parseInt(w)};});
  const actual = slot(delivery.sizes,width,height);
  const expected = width <= 767 ? (layer.id === 'crumbs' ? 1 : Math.min(width * mobile[layer.id][0],mobile[layer.id][1])) : width <=1100 ? width * fractions[layer.id] : Math.max(width, Math.max(640,Math.min(height-88,1000))*1672/941)*fractions[layer.id];
  assert(Math.abs(actual - expected)<.02, layer.id + ' at ' + width);
  const selected = width<=767 && layer.id==='crumbs' ? heroHiddenSource : (candidates.find(c=>c.width>=actual*dpr)||candidates.at(-1)).url;
  if(width<=767 && layer.id==='crumbs') assert(selected.startsWith('data:'));
  else assert(deliveries.has(selected));
  cases++;
 }
}
for(const language of ['en','ar']) {
 global.localStorage={getItem:()=>language};
 const html=renderToString(React.createElement(LanguageProvider,null,React.createElement(Hero)));
 assert(html.includes('dir="'+(language==='ar'?'rtl':'ltr')+'"'));
 assert(html.includes('href="#product-worlds"'));
 assert.equal((html.match(/<picture>/g)||[]).length,6);
 assert(html.includes('media="(max-width: 767px)" srcSet="'+heroHiddenSource+'"'));
 assert(!html.includes('/hero/crumbs.png'));
 // React must not emit a desktop-crumbs preload outside the responsive picture.
 const head=html.slice(0,html.indexOf('<section'));
 assert(!head.includes('/crumbs-'));
 for(const layer of heroLayers) assert(html.includes('prepared-'+layer.id));
 assert(html.includes('fetchPriority="high"'));
 assert(!html.includes('loading="lazy"'));
}
const hero = fs.readFileSync(root+'/src/components/Hero.tsx','utf8').replace(/\r\n/g,'\n');
assert.equal(hash(hero.slice(hero.indexOf('  useLayoutEffect('),hero.indexOf('  return <section'))),'9cfe5bdfb9a456d11a81eda05f5c85812ca1083f5d67acdb2caf7f2103225b8a','Approved GSAP sequence must remain unchanged');
assert.equal(hash(fs.readFileSync(root+'/src/styles/hero-preview.css','utf8').replace(/\r\n/g,'\n')),'9fbe0b59b8c9e82c6cc94c4138090e9bddf8d8460b71f53609fbedfd5950448d','Approved Hero geometry must remain unchanged');
console.log('Hero delivery: assets, original hashes, '+cases+' responsive/DPR cases, EN/AR SSR, no crumbs preload, unchanged CSS and GSAP passed.');
