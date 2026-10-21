const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file)
const data = require('../src/data/homepageFindGG.ts')
const copy = data.homepageFindGG
let language = 'en'
function load(hooks = React, extra = {}) {
 const exports = {}
 const imports = {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'), gsap: {},
  '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
  '../data/homepageFindGG': data, '../styles/homepage-find-gg.css': {},
  ...extra.imports,
 }
 const code = ts.transpileModule(fs.readFileSync('src/components/HomepageFindGG.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
 vm.runInNewContext(code, { exports, require: name => { assert(name in imports, name); return imports[name] }, ...extra.globals })
 return exports.default
}
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
for (language of ['en', 'ar']) {
 const Component = load()
 const html = renderToStaticMarkup(React.createElement(Component))
 assert.equal((html.match(/id="find-gg"/g) || []).length, 1, 'Stable navbar anchor')
 assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
 assert.ok(html.includes('aria-labelledby="home-find-title"'))
 for (const key of ['label', 'description', 'soon', 'geography', 'mapAlt']) assert.ok(html.includes(escape(copy[language][key])), key)
 for (const line of [...copy[language].headline, ...copy[language].supporting]) assert.ok(html.includes('>' + line + '</span>'))
 assert.ok(!/[?\uFFFD]/u.test(html.replace(/<[^>]*>/g, '')), 'No encoding corruption')
 assert.ok(!/<form|<button|<select|<input|<a\b|<h1\b/.test(html), 'No fake store search or clickable markers')
 assert.ok(!/latitude|longitude|mapUrl|store-id/.test(html), 'No invented retail coordinates')
 assert.equal((html.match(/class="home-find-pin home-find-pin--[^"]+" aria-hidden="true"/g) || []).length, 3)
 const images = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0])
 const paths = images.map(tag => tag.match(/src="([^"]+)"/)[1])
 assert.equal(new Set(paths).size, 7)
 assert.equal(paths.filter(p => p.endsWith('/web/find-gg-saudi-map.webp')).length, 1, 'Map stays a single foreground image')
 assert.equal(paths.filter(p => p.endsWith('/find-gg-cinematic-background.webp')).length, 1)
 assert.equal(paths.filter(p => p.endsWith('/web/find-gg-clean-fog.webp')).length, 1)
 assert.ok(!paths.some(p => p.endsWith('/find-gg-atmosphere.webp')), 'Old plain background is not downloaded')
 for (const image of images) {
  assert.ok(image.includes('loading="lazy"') && image.includes('decoding="async"'))
  assert.ok(/width="\d+" height="\d+"/.test(image), 'Reserved intrinsic image dimensions')
 }
 for (const path of paths) {
  assert.ok(path.startsWith('/section%206/'))
  assert.ok(fs.existsSync('public' + decodeURIComponent(path)), path)
  assert.ok(!/preview|arena-platform|mist-blue/.test(path), 'No flattened preview or unused branding assets')
 }
}
for (const asset of Object.values(data.homepageFindGGAssets)) {
 if (!asset.src.endsWith('.png')) continue
 const png = fs.readFileSync('public' + decodeURIComponent(asset.src))
 assert.equal(png.readUInt32BE(16), asset.width)
 assert.equal(png.readUInt32BE(20), asset.height)
}

// Mocked lifecycle checks, not browser layout or paint measurements.
for (const reduced of [false, true]) {
 let effect, observer, reverted = false, entryOptions, effectCleanup
 const document = { hidden: false, listener: null, addEventListener(name, fn) { assert.equal(name, 'visibilitychange'); this.listener = fn }, removeEventListener() { this.listener = null } }
 const tweens = []
 const animatedTargets = []
 function tween() { return { state: 'paused', play() { this.state = 'playing' }, pause() { this.state = 'paused' } } }
 const entrance = { ...tween(), from(target, vars) { assert.ok(!('filter' in vars)); return this } }
 const gsap = {
  matchMedia() { return {
   add(query, fn) { assert.equal(query, '(prefers-reduced-motion: no-preference)'); if (!reduced) effectCleanup = fn() },
   revert() { reverted = true; effectCleanup?.() },
  } },
  utils: { selector: () => query => query },
  to(target, vars) { animatedTargets.push(target); assert.ok(!('filter' in vars)); assert.equal(vars.paused, true); const t = tween(); tweens.push(t); return t },
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
  assert.ok(animatedTargets.includes('.home-find-fog'), 'Fog participates in visibility/reduced-motion lifecycle')
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


console.log('Find GG homepage: EN/AR/RTL, Coming Soon, no fake search/retail links, decorative markers, seven lazy supplied assets, single foreground map, cinematic backdrop/fog and dimensions, reduced motion, off-screen/tab pausing and cleanup passed. No browser layout measurement.');
