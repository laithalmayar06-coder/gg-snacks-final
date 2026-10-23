const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { MemoryRouter } = require('react-router')
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file)
const data = require('../src/data/homepageArena.ts')
const copy = data.homepageArena
let language = 'en'
function load(hooks = React, extra = {}) {
 const exports = {}
 const imports = {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
  'react-router': require('react-router'), gsap: {},
  '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
  '../data/homepageArena': data,
  '../styles/homepage-arena.css': {},
  ...extra.imports,
 }
 const source = fs.readFileSync('src/components/HomepageArena.tsx', 'utf8')
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
 vm.runInNewContext(code, { exports, require: name => { assert(name in imports, name); return imports[name] }, ...extra.globals })
 return exports.default
}
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
for (language of ['en', 'ar']) {
 const Component = load()
 const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component)))
 assert.equal((html.match(/id="gg-arena"/g) || []).length, 1)
 assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
 assert.ok(html.includes('aria-labelledby="homepage-arena-title"'))
 assert.ok(!html.includes('digital-arena-note'), 'Removed disclaimer must not render in either language')
 for (const key of ['label', 'activation', 'teaser', 'soon', 'details']) assert.ok(html.includes(escape(copy[language][key])), key)
 for (const line of copy[language].headline) assert.ok(html.includes('>' + line + '</span>'))
 assert.ok(!/[?\uFFFD]/u.test(html.replace(/<[^>]*>/g, '')), 'No broken copy encoding')
 assert.deepEqual([...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]), ['/arena'], 'Only informational Coming Soon destination')
 assert.ok(!/<form|<button|<h1\b|<video|<canvas/.test(html))
 assert.ok(!/\/rate\/|product-world|hero\//.test(html))
 assert.equal((html.match(/data-qr-replacement-slot=/g) || []).length, 2)
 assert.equal((html.match(/<g data-qr-replacement-slot=[^>]+><\/g>/g) || []).length, 2, 'Both QR cover slots remain empty')
 assert.ok(html.includes('aria-hidden="true"'))
 assert.equal((html.match(/<picture\b/g) || []).length, 1, 'One responsive image selection')
 assert.ok(html.includes('media="(max-width: 767px)"'))
 assert.ok(html.includes('width="941" height="1672"'))
 assert.ok(html.includes('width="1672" height="941"'))
 const paths = [...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)].map(m => m[1])
 assert.equal(new Set(paths).size, 2)
 for (const p of paths) { assert.ok(p.startsWith('/digital-arena/')); assert.ok(fs.existsSync('public' + p), p) }
 for (const image of html.matchAll(/<img\b[^>]*>/g)) {
  assert.ok(image[0].includes('loading="lazy"'))
  assert.ok(image[0].includes('decoding="async"'))
 }
 const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])
 assert.equal(new Set(ids).size, ids.length, 'Responsive lighting IDs must not collide')
 for (const m of html.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), 'Gradient references resolve')
}
const report = JSON.parse(fs.readFileSync('scripts/digital-arena-report.json', 'utf8'))
const crypto = require('node:crypto')
for (const item of report) {
 const original = fs.readFileSync('public/digital-arena/' + item.source)
 const delivery = fs.readFileSync('public/digital-arena/' + item.delivery)
 assert.equal(crypto.createHash('sha256').update(original).digest('hex'), item.sourceSHA256, 'Original PNG preserved')
 assert.equal(delivery.length, item.deliveryBytes)
 assert.ok(item.identicalDecodedRGBA && item.lossless)
 assert.ok(item.deliveryBytes < item.sourceBytes)
}

// Candidate hashes tie delivery files to the independently decoded optimization report.
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
for (const item of report) {
 const kind = item.width > item.height ? 'desktop' : 'mobile'
 const baseline = fs.readFileSync('public/digital-arena/' + item.delivery)
 assert.equal(sha256(baseline), item.deliverySHA256, 'Lossless rollback bytes preserved')
 assert.equal(data.digitalArenaLosslessArtwork[kind], '/digital-arena/' + item.delivery)
 assert.deepEqual(item.candidates.map(candidate => candidate.quality), [98, 95])
 for (const candidate of item.candidates) {
  const candidatePath = 'public/digital-arena/' + candidate.delivery
  // Q95 is comparison-only metadata, intentionally absent from a clean release.
  // Validate it when available locally; the approved Q98 is always required.
  if (candidate.quality === 95 && !fs.existsSync(candidatePath)) continue
  const bytes = fs.readFileSync(candidatePath)
  assert.equal(bytes.length, candidate.bytes)
  assert.equal(sha256(bytes), candidate.sha256, 'Candidate matches decoded verification report')
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  assert.equal(candidate.width, item.width)
  assert.equal(candidate.height, item.height)
  assert.equal(candidate.hasAlpha, item.hasAlpha)
  assert.equal(candidate.alphaDifferences, 0)
  assert.equal(candidate.lossless, false, 'Do not describe lossy candidates as pixel-identical')
  assert.ok(bytes.length < baseline.length)
 }
 const selected = item.candidates.find(candidate => candidate.quality === 98)
 assert.equal(data.digitalArenaArtwork[kind], '/digital-arena/' + selected.delivery)
}
// Verify rendered source/fallback routing at every requested breakpoint in both locales.
for (language of ['en', 'ar']) {
 const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(load())))
 const source = html.match(/<source[^>]*>/)[0]
 const fallback = html.match(/<img[^>]*>/)[0]
 assert.ok(source.includes('media="(max-width: 767px)"'))
 for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  const selected = width <= 767 ? source : fallback
  assert.ok(selected.includes(data.digitalArenaArtwork[width <= 767 ? 'mobile' : 'desktop']), 'Picture source at ' + width)
 }
}

// Mocked lifecycle checks, not browser layout or paint measurements.
for (const reduced of [false, true]) {
 let effect, observer, reverted = false, entryOptions, effectCleanup
 const document = { hidden: false, listener: null, addEventListener(name, fn) { assert.equal(name, 'visibilitychange'); this.listener = fn }, removeEventListener() { this.listener = null } }
 const tweens = []
 function tween() { return { state: 'paused', play() { this.state = 'playing' }, pause() { this.state = 'paused' } } }
 const entrance = { ...tween(), from(target, vars) { assert.ok(!('filter' in vars)); return this } }
 const gsap = {
  matchMedia() { return {
   add(query, fn) { assert.equal(query, '(prefers-reduced-motion: no-preference)'); if (!reduced) effectCleanup = fn() },
   revert() { reverted = true; effectCleanup?.() },
  } },
  utils: { selector: () => query => query },
  to(target, vars) { assert.ok(!('filter' in vars)); assert.equal(vars.paused, true); const t = tween(); tweens.push(t); return t },
  timeline(options) { entryOptions = options; return entrance },
 }
 const Component = load({ useRef: () => ({ current: {} }), useLayoutEffect: fn => { effect = fn } }, {
  imports: { gsap },
  globals: { document, IntersectionObserver: class {
   constructor(callback) { observer = this; this.callback = callback }
   observe() {} disconnect() { this.disconnected = true }
  } },
 })
 Component()
 const cleanup = effect()
 if (reduced) { assert.equal(tweens.length, 0); assert.equal(observer, undefined) }
 else {
  assert.ok(tweens.every(t => t.state === 'paused'), 'No idle motion before visibility')
  observer.callback([{ isIntersecting: true }])
  assert.equal(entrance.state, 'playing')
  assert.ok(tweens.every(t => t.state === 'paused'), 'Idle starts after entrance')
  observer.callback([{ isIntersecting: false }])
  assert.equal(entrance.state, 'paused')
  observer.callback([{ isIntersecting: true }])
  entryOptions.onComplete()
  assert.ok(tweens.every(t => t.state === 'playing'))
  document.hidden = true; document.listener()
  assert.ok(tweens.every(t => t.state === 'paused'))
  document.hidden = false; document.listener()
  observer.callback([{ isIntersecting: false }])
  assert.ok(tweens.every(t => t.state === 'paused'))
 }
 cleanup()
 assert.ok(reverted)
 if (!reduced) { assert.ok(observer.disconnected); assert.equal(document.listener, null) }
}

console.log('Digital Arena: EN/AR/RTL, truthful teaser and inert QR slots, responsive Q98 references, candidate integrity and preserved lossless originals, reduced motion, off-screen/tab pausing and cleanup passed. Browser layout not measured.');
