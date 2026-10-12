const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { MemoryRouter } = require('react-router')
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, file)
const copy = require('../src/data/homepageTournaments.ts').homepageTournaments
assert.ok(copy.en.introduction.includes('what\u2019s next'), 'Use the real typographic apostrophe')
assert.deepEqual([...copy.ar.headline], ['\u0633\u0627\u062d\u062a\u0643', '\u0628\u0627\u0646\u062a\u0638\u0627\u0631\u0643'])
for (const locale of ['en', 'ar']) {
 for (const value of Object.values(copy[locale]).flat()) {
  assert.ok(!/[?\uFFFD]/u.test(value), 'No corrupted question marks or replacement characters in section copy')
  if (locale === 'ar') assert.ok(/[\u0600-\u06ff]/u.test(value), 'Every Arabic label contains real Arabic')
 }
}
let language = 'en', row
function load(hooks = React, extra = {}) {
 const exports = {}
 const imports = {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
  'react-router': require('react-router'), gsap: {},
  '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
  '../cms/CmsProvider': { useCms: () => ({ tournament_content: row ? [row] : undefined }) },
  '../cms/publicCatalog': {
   textValue: (r, key) => typeof r?.[key] === 'string' ? r[key] : '',
   localized: (r, key) => r ? { en: r[key + '_en'], ar: r[key + '_ar'] } : null,
  },
  '../data/homepageTournaments': { homepageTournaments: copy },
  '../styles/homepage-tournaments.css': {},
  ...extra.imports,
 }
 const source = fs.readFileSync('src/components/HomepageTournaments.tsx', 'utf8')
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
 vm.runInNewContext(code, { exports, require: name => { assert(name in imports, name); return imports[name] }, ...extra.globals })
 return exports.default
}
for (language of ['en', 'ar']) {
 row = undefined
 const Component = load()
 const render = () => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Component)))
 const html = render()
 assert.ok(html.includes('id="gg-tournaments"'))
 assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
 assert.ok(html.includes('href="/tournaments"'))
 for (const kind of ['calendar', 'trophy', 'arrow']) {
  assert.ok(html.includes('class="gateway-icon gateway-icon-' + kind + '"'), kind + ' uses reliable SVG artwork')
 }
 assert.ok(html.includes('d="M7 17 17 7M7 7h10v10"'))
 assert.ok(!/[?\uFFFD]/u.test(html.replace(/<[^>]*>/g, '')), 'Rendered labels contain no corrupted glyphs')
 assert.ok(html.includes(copy[language].headline[0]) && html.includes(copy[language].headline[1]))
 assert.ok(html.includes(copy[language].registrationMonth) && html.includes(copy[language].tournamentMonth))
 assert.ok(!/<form|<button|role="timer"|datetime=/i.test(html), 'Teaser must not imply signup or an exact countdown')
 assert.equal((html.match(/<h2\b/g) || []).length, 1)
 assert.ok(html.includes('media="(max-width: 767px)"'))
 const paths = [...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)].map(match => match[1])
 assert.equal(new Set(paths).size, 5)
 for (const path of paths) assert.ok(fs.existsSync('public' + path), path)
 row = { description_en: 'CMS tournament introduction', description_ar: 'وصف البطولة', registration_date: '2027-01-23', tournament_date: '2027-03-19' }
 const managed = render()
 assert.ok(managed.includes(row['description_' + language]))
 const displayedDates = [...managed.matchAll(/<dd>(.*?)<\/dd>/g)].map(match => match[1])
 assert.deepEqual(displayedDates, ['2027-01-23', '2027-03-19'].map(value => new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')).toLocaleUpperCase(language)), 'CMS dates use month precision only')
 row = { registration_date: '2027-02-30', tournament_date: 'invalid' }
 assert.ok(render().includes(copy[language].registrationMonth))
 assert.ok(render().includes(copy[language].tournamentMonth))
}
// Deterministic lifecycle checks; no claim of real-browser paint or layout measurement.
for (const reduced of [false, true]) {
 let effect, observer, reverted = false, entryOptions, effectCleanup
 const document = { hidden: false, listener: null, addEventListener(name, fn) { this.listener = fn }, removeEventListener() { this.listener = null } }
 const tweens = []
 function tween() { return { state: 'paused', play() { this.state = 'playing' }, pause() { this.state = 'paused' } } }
 const entrance = { ...tween(), from(target, vars) { assert.ok(!('filter' in vars)); return this } }
 const gsap = {
  matchMedia() { return {
   add(query, fn) { assert.equal(query, '(prefers-reduced-motion: no-preference)'); if (!reduced) effectCleanup = fn() },
   revert() { reverted = true; effectCleanup?.() },
  } },
  utils: { selector: () => query => query },
  to(target, vars) { assert.ok(!('filter' in vars)); const t = tween(); tweens.push(t); return t },
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
  observer.callback([{ isIntersecting: true }])
  assert.equal(entrance.state, 'playing')
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
console.log('Arena Gateway: EN/AR, month-only dates, CMS description/fallback, real details route, responsive asset paths, no fake signup/countdown, visibility/reduced-motion and animation cleanup passed (mocked lifecycle).')
