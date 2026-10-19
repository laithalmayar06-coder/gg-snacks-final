const fs = require('node:fs')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const ts = require('typescript')
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename)
}
require.extensions['.css'] = () => {}
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const BrandMark = require('../src/components/BrandMark.tsx').default
const { officialLogo } = require('../src/data/brand.ts')
const master = fs.readFileSync('public/gg-logo-new.png.png')
assert.equal(crypto.createHash('sha256').update(master).digest('hex'), '1ecceb39499080256cf9048c5b803b4db3e9011ec4c8f5b632dc23189e524616', 'Exact supplied master stays untouched')
for (const [file, width, height] of [['public/gg-logo-new.png.png',1268,1241],['public/brand/gg-logo-512.png',512,501],['public/brand/gg-logo-128.png',128,125],['public/brand/gg-logo-48.png',48,47]]) {
  const png = fs.readFileSync(file)
  assert.equal(png.subarray(1,4).toString(), 'PNG')
  assert.equal(png.readUInt32BE(16), width)
  assert.equal(png.readUInt32BE(20), height)
  assert.equal(png[25], 6, file + ' retains an RGBA alpha channel')
}
for (const [language, dir, label] of [['en','ltr','GG Snacks'],['ar','rtl','?? ?? ?????']]) {
  const html = renderToStaticMarkup(React.createElement('a', { href:'/', lang:language, dir, 'aria-label':label }, React.createElement(BrandMark)))
  assert.ok(html.includes('alt=""'))
  assert.ok(html.includes('aria-label="' + label + '"'))
  assert.ok(html.includes(officialLogo.small))
  assert.ok(html.includes(officialLogo.src + ' 512w'))
  assert.ok(html.includes('width="1268" height="1241"'))
  assert.ok(!html.includes('brand-symbol'))
}
const staff = renderToStaticMarkup(React.createElement(BrandMark, {alt:'GG', className:'official-brand-mark--staff'}))
assert.ok(staff.includes('alt="GG"'))
assert.equal(require('../src/data/heroPreview.ts').heroPreviewLogo, officialLogo.small)
assert.equal(require('../src/data/homepageFooter.ts').homepageFooterLogo, officialLogo.src)
assert.ok(fs.readFileSync('index.html','utf8').includes('type="image/png" href="/brand/gg-logo-48.png"'))
const favicon = fs.readFileSync('public/favicon.svg','utf8')
assert.ok(!favicon.includes('<path'))
assert.deepEqual(Buffer.from(favicon.match(/base64,([^" ]+)/)[1], 'base64'), fs.readFileSync('public/brand/gg-logo-48.png'))
console.log('Official logo: untouched master, RGBA delivery dimensions, accessible EN/AR shared branding, responsive sources and derived favicon passed. Browser visual sizing not measured.')
