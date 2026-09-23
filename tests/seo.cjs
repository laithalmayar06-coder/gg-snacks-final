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