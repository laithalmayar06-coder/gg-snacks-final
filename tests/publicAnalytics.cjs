const fs = require('node:fs'), ts = require('typescript'), assert = require('node:assert/strict')
require.extensions['.ts'] = (module, path) => module._compile(ts.transpileModule(fs.readFileSync(path,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,path)
const { analyticsPath, cleanAnalyticsUrl, routeEvents } = require('../src/analytics/policy.ts')
for (const path of ['/', '/products', '/contact', '/business', '/feedback', '/arena', '/tournaments', '/find-gg', '/faq', '/privacy', '/terms', '/about']) assert.equal(analyticsPath(path),path)
for (const path of ['/admin/login', '/admin/mfa', '/admin/enquiries', '/admin/products', '/dashboard/ratings', '/unknown', '/rate/invalid/flavor-1']) {
 assert.equal(analyticsPath(path),null)
 assert.equal(cleanAnalyticsUrl('https://example.test/products?email=secret',path),null)
 assert.equal(cleanAnalyticsUrl('https://example.test'+path,'/'),null)
}
assert.equal(cleanAnalyticsUrl('https://example.test/contact?email=secret#message','/contact'),'https://example.test/contact')
assert.equal(cleanAnalyticsUrl('https://example.test/products/private-input?name=test','/products/private-input'),'https://example.test/products/:productSlug')
assert.equal(analyticsPath('/rate/loots/flavor-1'),'/rate/:productSlug/:flavorSlug')
assert.equal(cleanAnalyticsUrl('not a URL','/'),null)
assert.equal(Object.keys(routeEvents).length,6)
assert.equal(routeEvents['/feedback'],'feedback_started')
console.log('Public analytics: route exclusions, query/fragment removal, dynamic path redaction and fixed event mapping passed.')
assert.equal(cleanAnalyticsUrl('https://example.test/rate/:productSlug/:flavorSlug', '/rate/loots/flavor-1'), 'https://example.test/rate/:productSlug/:flavorSlug')

// Exercise the real analytics effect with local provider/DOM adapters; no network requests.
const vm = require('node:vm')
function analyticsHarness({ host = 'www.gg-snacks.com', prod = true, events = true, path = '/' } = {}) {
 const listeners = new Set(), calls = { inject: [], pageview: [], track: [] }
 const window = { location: { hostname: host, origin: 'https://' + host, pathname: path } }
 const document = {
  addEventListener(name, fn, capture) { assert.equal(name, 'click'); assert.equal(capture, true); listeners.add(fn) },
  removeEventListener(name, fn, capture) { assert.equal(name, 'click'); assert.equal(capture, true); listeners.delete(fn) },
 }
 class Element { closest() { return null } }
 class HTMLAnchorElement extends Element {
  constructor(href) { super(); this.href = new URL(href, window.location.origin).href }
  closest(selector) { assert.equal(selector, '.hero-actions a'); return this }
 }
 let effect, cleanup
 const ref = { current: null }
 const imports = {
  react: { useRef: () => ref, useEffect: fn => { effect = fn } },
  'react-router': { useLocation: () => ({ pathname: window.location.pathname }) },
  '@vercel/analytics': Object.fromEntries(Object.keys(calls).map(name => [name, (...args) => calls[name].push(args)])),
  './policy': { analyticsPath, cleanAnalyticsUrl, routeEvents },
 }
 const source = fs.readFileSync('src/analytics/PublicAnalytics.tsx', 'utf8')
  .replace(/import\.meta\.env/g, JSON.stringify({ PROD: prod, VITE_ANALYTICS_CUSTOM_EVENTS: String(events) }))
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
 const exports = {}
 vm.runInNewContext(code, { exports, require: name => { assert(name in imports, name); return imports[name] }, window, document, Element, HTMLAnchorElement, URL })
 const render = next => {
  cleanup?.()
  window.location.pathname = next
  exports.default()
  cleanup = effect()
 }
 render(path)
 return {
  calls, listeners, render,
  click(href = '#product-worlds') {
   const anchor = new HTMLAnchorElement(href)
   const child = new Element()
   child.closest = selector => anchor.closest(selector)
   for (const fn of listeners) fn({ target: child })
  },
  unmount() { cleanup?.() },
 }
}
for (const host of ['localhost', '127.0.0.1', 'gg-snacks.com', 'gg-snacks-final.vercel.app', 'preview-123.vercel.app', 'www.gg-snacks.com.example.test']) {
 const h = analyticsHarness({ host })
 assert.equal(h.calls.inject.length, 0)
 assert.equal(h.calls.pageview.length, 0)
 assert.equal(h.listeners.size, 0)
}
assert.equal(analyticsHarness({ prod: false }).calls.inject.length, 0)
for (const path of ['/admin/login', '/admin/mfa', '/admin/enquiries', '/dashboard/ratings', '/unknown']) {
 const h = analyticsHarness({ path })
 assert.equal(h.calls.inject.length, 0)
 assert.equal(h.listeners.size, 0)
}
const h = analyticsHarness()
assert.equal(h.calls.inject.length, 1)
assert.equal(h.calls.pageview.length, 1)
assert.equal(h.calls.track.length, 0, 'Mounting a section must not count as a CTA click')
h.click()
assert.equal(h.calls.track.length, 1)
assert.equal(h.calls.track[0][0], 'explore_products_click')
assert.equal(h.calls.track[0].length, 1, 'No personal data or additional properties')
for (const href of ['/products', '#other', '/contact#product-worlds', 'https://example.test/#product-worlds']) h.click(href)
assert.equal(h.calls.track.length, 1)
h.render('/') // Effect cleanup/replay, as in StrictMode, must leave one listener.
assert.equal(h.listeners.size, 1)
assert.equal(h.calls.pageview.length, 1)
h.click()
assert.equal(h.calls.track.length, 2, 'Exactly one event per click after effect replay')
const beforeSend = h.calls.inject[0][0].beforeSend
assert.equal(beforeSend({ url: 'https://www.gg-snacks.com/?email=private#message' }).url, 'https://www.gg-snacks.com/')
h.render('/admin/login')
assert.equal(h.listeners.size, 0)
assert.equal(beforeSend({ url: 'https://www.gg-snacks.com/admin/login' }), null)
h.render('/')
assert.equal(h.calls.inject.length, 1)
h.unmount()
assert.equal(h.listeners.size, 0)
const disabled = analyticsHarness({ events: false })
assert.equal(disabled.calls.pageview.length, 1)
assert.equal(disabled.listeners.size, 0)
disabled.click()
assert.equal(disabled.calls.track.length, 0)
disabled.unmount()
console.log('Analytics effect: exact production host, preview/dev/staff exclusions, opt-in events, Hero anchor clicks, no duplicate listeners or event payloads passed.')
