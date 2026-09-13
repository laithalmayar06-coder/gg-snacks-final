const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
function load(path, imports = {}) {
  const box = { exports: {}, URL, require: name => imports[name] }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, box)
  return box.exports
}
const content = load('src/data/siteContent.ts')
const links = load('src/data/siteLinks.ts', { './siteContent': content })
const translations = load('src/i18n/translations.ts', { '../data/siteContent': content }).translations
assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.ar).sort())
assert.equal(content.siteContent.company.legalName, null)
assert.equal(links.getSocialLinks().length, 0)
assert.equal(links.getContactDetail('email', 'en'), null)
assert.equal(links.safeWebUrl('javascript:alert(1)'), null)
assert.equal(links.safeWebUrl('not a url'), null)
content.siteContent.contact.email = 'team@example.test'
assert.ok(links.getContactDetail('email', 'en').href.startsWith('mailto:'))
content.siteContent.contact.socialLinks.instagram = 'https://example.test/profile'
assert.equal(links.getSocialLinks().length, 1)
assert.equal(translations.en.footerLocation, 'Jeddah, Saudi Arabia')
assert.equal(translations.en.universeDescription, content.siteContent.company.shortDescription.en)
assert.equal(translations.ar.location, 'جدة / المملكة العربية السعودية')
console.log('Site content and safe-link checks passed')
