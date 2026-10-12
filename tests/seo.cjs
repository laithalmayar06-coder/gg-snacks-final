const fs = require('node:fs')
const ts = require('typescript')
const assert = require('node:assert/strict')
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename)
const { pageMetadata, siteOrigin, sitemapPaths } = require('../src/data/seo.ts')
for (const language of ['en', 'ar']) {
  for (const path of sitemapPaths) {
    const meta = pageMetadata(path, language)
    assert.ok(meta.title && meta.description)
    assert.equal(meta.canonical, new URL(path, siteOrigin).href)
    assert.equal(meta.robots, 'index, follow')
  }
  for (const path of ['/admin/login', '/admin/mfa', '/admin/content', '/dashboard/ratings', '/rate/loots/flavor-1', '/missing', '/products/missing']) {
    const meta = pageMetadata(path, language)
    assert.equal(meta.canonical, null)
    assert.equal(meta.robots, 'noindex, nofollow')
  }
  const meta = pageMetadata('/products/loots/', language, { name: 'LOOTS', description: 'Approved CMS description' })
  assert.equal(meta.description, 'Approved CMS description')
  assert.equal(meta.canonical, `${siteOrigin}/products/loots`)
}
assert.notEqual(pageMetadata('/about', 'en').title, pageMetadata('/about', 'ar').title)
assert.equal(pageMetadata('/', 'ar').locale, 'ar_SA')
const xml = fs.readFileSync('dist/sitemap.xml', 'utf8')
for (const path of sitemapPaths) assert.ok(xml.includes(`<loc>${new URL(path, siteOrigin).href}</loc>`))
assert.ok(!xml.includes('/admin') && !xml.includes('/rate/') && !xml.includes('/dashboard'))
assert.ok(fs.readFileSync('dist/robots.txt', 'utf8').includes(`Sitemap: ${siteOrigin}/sitemap.xml`))
console.log('SEO metadata: EN/AR public, CMS product, utility and unknown routes; production sitemap/robots passed.')
// Pin the approved origin independently of the implementation under test.
const canonicalOrigin = 'https://www.gg-snacks.com'
assert.equal(siteOrigin, canonicalOrigin)
assert.deepEqual(sitemapPaths, ['/', '/products', '/arena', '/tournaments', '/find-gg', '/feedback', '/business', '/contact', '/faq', '/privacy', '/terms', '/about'])
const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
assert.deepEqual(locations, sitemapPaths.map(path => canonicalOrigin + path))
const robots = fs.readFileSync('dist/robots.txt', 'utf8')
assert.equal(robots.split('\n').filter(line => line.startsWith('Sitemap:')).join('\n'), 'Sitemap: ' + canonicalOrigin + '/sitemap.xml')
for (const text of [xml, robots]) {
 assert.ok(!/gg-snacks-final\.vercel\.app|localhost|127\.0\.0\.1/.test(text))
}
const builtScripts = fs.readdirSync('dist/assets').filter(name => name.endsWith('.js')).map(name => fs.readFileSync('dist/assets/' + name, 'utf8'))
assert.ok(builtScripts.some(text => text.includes(canonicalOrigin)), 'Production bundle includes the approved metadata origin')
const html = fs.readFileSync('dist/index.html', 'utf8')
assert.ok((html.match(/rel=["']canonical["']/g) ?? []).length <= 1)

// Test the real client metadata effect across route/language changes without a browser.
const vm = require('node:vm')
let route = '/', language = 'en', effect
const nodes = []
const document = {
 title: '',
 createElement(tag) {
  return { tag, setAttribute(name, value) { this[name] = value }, remove() { const i = nodes.indexOf(this); if (i >= 0) nodes.splice(i, 1) } }
 },
 head: {
  appendChild(node) { nodes.push(node) },
  querySelector(selector) {
   const [, tag, attr, value] = selector.match(/^(\w+)\[(\w+)="([^"]+)"\]$/)
   return nodes.find(node => node.tag === tag && node[attr] === value) ?? null
  },
 },
}
const imports = {
 react: { useEffect: fn => { effect = fn } },
 'react-router': { useLocation: () => ({ pathname: route }) },
 '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
 '../cms/publicCatalog': { useCatalog: () => [{ slug: 'pop-g', name: 'POP-G' }] },
 '../data/seo': { pageMetadata, siteOrigin },
 '../data/siteContent': require('../src/data/siteContent.ts'),
}
const componentExports = {}
const componentCode = ts.transpileModule(fs.readFileSync('src/components/PageMetadata.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
vm.runInNewContext(componentCode, { exports: componentExports, require: name => { assert(name in imports, name); return imports[name] }, document, URL })
for (language of ['en', 'ar']) {
 for (route of ['/', '/products', '/products/pop-g', '/about', '/about', '/rate/pop-g/flavor-1', '/admin/login', '/missing', '/contact']) {
  componentExports.default()
  effect()
  const meta = pageMetadata(route, language, route === '/products/pop-g' ? { name: 'POP-G' } : undefined)
  const canonical = nodes.filter(node => node.tag === 'link' && node.rel === 'canonical')
  assert.equal(canonical.length, meta.canonical ? 1 : 0, route + ': no duplicate/stale canonical')
  assert.equal(canonical[0]?.href ?? null, meta.canonical)
  assert.equal(document.title, meta.title)
  assert.equal(nodes.find(node => node.property === 'og:url')?.content ?? null, meta.canonical)
 }
}
console.log('Production SEO artifacts and metadata lifecycle passed: approved www origin, unchanged sitemap scope, EN/AR, route paths and single canonical tag.')
