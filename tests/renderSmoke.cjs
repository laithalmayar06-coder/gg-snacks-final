const fs = require('node:fs')
const ts = require('typescript')
const assert = require('node:assert/strict')
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})')
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename)
}
require.extensions['.css'] = () => {}
const React = require('react')
const { renderToString } = require('react-dom/server')
const { MemoryRouter, Routes, Route } = require('react-router')
const { LanguageProvider } = require('../src/i18n/LanguageContext.tsx')
const cases = [
  ['/admin/enquiries', '/admin/enquiries', 'AdminEnquiries', 'role="status"'],
  ['/admin/mfa', '/admin/mfa', 'StaffMfa', 'Restoring session'],
  ['/admin/products', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/admin/flavors', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/admin/stores', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/admin/content', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/admin/tournament', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/admin/contact', '/admin/:section', '../cms/CmsAdmin', 'Checking staff access'],
  ['/arena', '/arena', 'PublicPage', 'gg-app-preview'],
  ['/tournaments', '/tournaments', 'PublicPage', 'event-details'],
  ['/find-gg', '/find-gg', 'PublicPage', 'store-results'],
  ['/feedback', '/feedback', 'PublicPage', 'feedback-family'],
  ['/business', '/business', 'PublicPage', 'enquiry-requestType'],
  ['/contact', '/contact', 'PublicPage', 'enquiry-message'],
  ['/faq', '/faq', 'PublicPage', '<details>'],
  ['/privacy', '/privacy', 'PublicPage', 'public-legal'],
  ['/terms', '/terms', 'PublicPage', 'public-legal'],
  ['/about', '/about', 'PublicPage', 'public-about-grid'],
  ['/unknown', '*', 'NotFound', 'GG / 404'],
  ['/', '/', 'Home', 'product-worlds'],
  ['/products', '/products', 'Products', '/products/loots'],
  ['/products/loots', '/products/:productSlug', 'ProductFamily', '/rate/loots/flavor-1'],
  ['/products/trigger', '/products/:productSlug', 'ProductFamily', '/rate/trigger/flavor-1'],
  ['/products/x-stix', '/products/:productSlug', 'ProductFamily', '/rate/x-stix/flavor-1'],
  ['/products/pop-g', '/products/:productSlug', 'ProductFamily', '/rate/pop-g/flavor-1'],
  ['/products/invalid', '/products/:productSlug', 'ProductFamily', 'catalogue-not-found'],
  ['/rate/loots/flavor-1', '/rate/:productSlug/:flavorSlug', 'RateSnack', 'rating-options'],
  ['/rate/loots/invalid', '/rate/:productSlug/:flavorSlug', 'RateSnack', 'rating-error'],
  ['/admin/login', '/admin/login', 'AdminLogin', 'staff-password'],
  ['/dashboard/ratings', '/dashboard/ratings', 'RatingsDashboard', 'Loading ratings'],
]
for (const language of ['en', 'ar']) {
  global.localStorage = { getItem: () => language }
  for (const [url, path, page, expected] of cases) {
    const Component = require(`../src/pages/${page}.tsx`).default
    const html = renderToString(React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(LanguageProvider, null, React.createElement(Routes, null, React.createElement(Route, { path, element: React.createElement(Component) })))))
    assert.ok(html.includes(expected), `${language} ${url} missing ${expected}`)
    if (page === 'PublicPage') {
      assert.equal((html.match(/<main\b/g) ?? []).length, 1)
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
      assert.ok(html.includes('href="/feedback"'))
      assert.ok(html.includes('href="/privacy"'))
      assert.ok(!html.includes('FINAL LEGAL COPY REQUIRED'))
      if (url === '/feedback') {
        assert.ok(/id="feedback-flavour"[^>]*disabled/.test(html))
        assert.ok(/type="submit"[^>]*disabled/.test(html))
        assert.ok(html.includes(language === 'en' ? 'YOUR FEEDBACK MATTERS TO US' : 'رأيك يهمنا'))
      }
      if (url === '/find-gg') { assert.ok(!html.includes('Sample store A') && !html.includes('متجر نموذجي أ')); assert.ok(html.includes('store-results')) }
      if (url === '/business' || url === '/contact') assert.ok(html.includes(language === 'en' ? 'Send your enquiry to GG Snacks.' : 'أرسل استفسارك إلى جي جي سناكس.'))
    }
    if (page === 'Home') {
      assert.equal((html.match(/<main\b/g) ?? []).length, 1)
      assert.ok(html.indexOf('</main>') < html.indexOf('<footer'))
      assert.ok(html.includes('to=') === false)
      const sections = ['home-hero', 'product-worlds', 'featured-products', 'gg-universe', 'why-gg', 'gg-arena', 'gg-tournaments', 'find-gg', 'contact']
      let previous = -1
      for (const id of sections) {
        const position = html.indexOf(`id="${id}"`)
        assert.ok(position > previous, `${language}: missing or misplaced homepage section ${id}`)
        previous = position
      }
      for (const slug of ['pop-g', 'trigger', 'loots', 'x-stix']) assert.ok(html.includes(`href="/products/${slug}"`))
      assert.ok(html.includes('id="rate-your-snack"'), 'Keep the existing rating entry anchor')
      assert.ok(/id="gg-city"[^>]*disabled/.test(html))
      assert.ok(/id="gg-district"[^>]*disabled/.test(html))
      assert.ok(html.includes(language === 'en' ? 'SNACKS BUILT' : 'سناكات صُممت'))

    }
    if (page === 'RateSnack' && !url.includes('invalid')) {
      assert.equal((html.match(/type="radio"/g) ?? []).length, 5)
      assert.ok(/type="submit"[^>]*disabled/.test(html))
    }
  }
}
delete global.localStorage
console.log(`${cases.length * 2} English/Arabic server-render smoke checks passed (not browser layout tests)`)
