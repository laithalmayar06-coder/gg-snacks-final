const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { MemoryRouter } = require('react-router')
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file)
const copy = require('../src/data/homepageStory.ts').homepageStory
assert.equal(copy.en.pillarDescriptions[1], 'Quality in every detail.')
assert.equal(copy.ar.pillarDescriptions[1], "الجودة في كل تفصيل.")
assert.ok(!JSON.stringify(copy).includes('Premium ingredients. Higher standards.'))
let language = 'en'
function load(hooks = React, extra = {}) {
 const exports = {}
 const imports = {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
  'react-router': require('react-router'), gsap: {},
  '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
  '../data/homepageStory': { homepageStory: copy },
  '../styles/homepage-story.css': {},
  ...extra.imports,
 }
 const source = fs.readFileSync('src/components/HomepageStory.tsx', 'utf8')
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
 vm.runInNewContext(code, { exports, require: name => { assert(name in imports, name); return imports[name] }, ...extra.globals })
 return exports.default
}
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
for (language of ['en', 'ar']) {
 const Component = load()
 const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component)))
 assert.equal((html.match(/id="gg-universe"/g) || []).length, 1)
 assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
 assert.ok(html.includes('aria-labelledby="story-title"'))
 for (const key of ['label', 'heading', 'subtitle', 'cta']) assert.ok(html.includes(escape(copy[language][key])), key)
 for (const paragraph of copy[language].description.split('\n\n')) assert.ok(html.includes(escape(paragraph)))
 assert.equal((html.match(/<li\b/g) || []).length, 3)
 for (const value of [...copy[language].pillars, ...copy[language].pillarDescriptions]) assert.ok(html.includes(escape(value)))
 assert.ok(html.includes('href="/business"'), 'Preserve existing CTA destination')
 assert.ok(html.includes('d="M7 17 17 7M7 7h10v10"'), 'Reliable decorative arrow')
 assert.ok(!/[?\uFFFD]/u.test(html.replace(/<[^>]*>/g, '')), 'No corrupted copy')
 if (language === 'ar') assert.ok(html.includes('\u0647\u0630\u0647 \u0647\u064a \u062c\u064a \u062c\u064a'))
 assert.ok(html.includes('media="(max-width: 767px)"'))
 assert.ok(html.includes('width="768" height="1320"'))
 const paths = [...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)].map(m => m[1])
 assert.equal(new Set(paths).size, 5)
 for (const path of paths) { assert.ok(path.startsWith('/our-story/')); assert.ok(fs.existsSync('public' + path), path) }
 for (const image of html.matchAll(/<img\b[^>]*>/g)) {
  assert.ok(image[0].includes('loading="lazy"'))
  assert.ok(image[0].includes('decoding="async"'))
  assert.ok(/width="\d+" height="\d+"/.test(image[0]), 'Explicit intrinsic dimensions')
 }
 assert.equal((html.match(/<picture>/g) || []).length, 0) // picture has the scene class
 assert.equal((html.match(/<picture\b/g) || []).length, 1, 'One responsive source, not duplicate background images')
 assert.ok(!/<form|<button|<h1\b/.test(html))
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
console.log('Our Story: EN/AR/RTL render, preserved story/pillars/business CTA, five lazy responsive asset paths, encoding, reduced motion, off-screen/tab pausing and cleanup passed (mocked lifecycle; no browser layout measurements).')
