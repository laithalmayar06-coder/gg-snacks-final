const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')
const assert = require('node:assert/strict')
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace(/import\.meta\.env/g, '({})')
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename)
}
require.extensions['.css'] = () => {}
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { MemoryRouter } = require('react-router')
const { LanguageProvider } = require('../src/i18n/LanguageContext.tsx')
const Footer = require('../src/components/HomepageFooter.tsx').default
const { homepageFooter, homepageFooterGroups, homepageFooterLegal, homepageFooterLogo } = require('../src/data/homepageFooter.ts')
const { publicNavigation, secondaryNavigation } = require('../src/data/publicContent.ts')
const { translations } = require('../src/i18n/translations.ts')
const { homepageContactAssets } = require('../src/data/homepageContact.ts')
const validRoutes = [...publicNavigation, ...secondaryNavigation].map(link => link.path)
for (const language of ['en', 'ar']) {
  global.localStorage = { getItem: () => language }
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(LanguageProvider, null, React.createElement(Footer))))
  assert.equal((html.match(/<footer\b/g) || []).length, 1)
  assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
  assert.ok(html.includes(homepageFooter[language].tagline))
  assert.ok(html.includes(translations[language].footerSocialPending), 'Unconfigured socials remain a non-link placeholder')
  assert.ok(html.includes(translations[language].contactPending))
  assert.ok(html.includes('aria-pressed="true"'))
  assert.ok(!html.includes('\uFFFD'))
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1])) assert.ok(validRoutes.includes(href), href)
  for (const path of [...homepageFooterGroups.flatMap(group => group.paths), ...homepageFooterLegal]) assert.ok(html.includes('href="' + path + '"'))
  for (const asset of [homepageFooterLogo, homepageContactAssets.background.src, homepageContactAssets.fog.src, homepageContactAssets.halo.src, homepageContactAssets.platform.src]) {
    assert.ok(html.includes(asset)); assert.ok(fs.existsSync('public' + decodeURIComponent(asset)))
  }
  assert.equal((html.match(/loading="lazy"/g) || []).length, 5)
}
delete global.localStorage

// Exercise actual event handlers and GSAP lifecycle with no browser/network writes.
const code = ts.transpileModule(fs.readFileSync('src/components/HomepageFooter.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
const nodes = node => !node || typeof node !== 'object' ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)]
for (const reduced of [false, true]) {
  let effect, cleanup, observer, listener, reverted = false, options, targetPresent = true
  const scrolls = [], focuses = [], languages = [], tweens = []
  const tween = () => ({ active: false, play() { this.active = true }, pause() { this.active = false } })
  const entrance = { ...tween(), from() { return this } }
  const doc = { hidden: false, getElementById: () => targetPresent ? { focus: value => focuses.push(value) } : null, addEventListener(_, fn) { listener = fn }, removeEventListener() { listener = null } }
  const gsap = { utils: { selector: () => value => value },
    matchMedia: () => ({ add(query, fn) { assert.equal(query, '(prefers-reduced-motion: no-preference)'); if (!reduced) cleanup = fn() }, revert() { reverted = true; cleanup?.() } }),
    to(_, vars) { assert.ok(!('filter' in vars)); const value = tween(); tweens.push(value); return value },
    timeline(value) { options = value; return entrance },
  }
  const imports = {
    react: { ...React, useRef: () => ({ current: {} }), useLayoutEffect: fn => { effect = fn } },
    'react/jsx-runtime': require('react/jsx-runtime'), 'react-router': { Link: 'a' }, gsap,
    '../i18n/LanguageContext': { useLanguage: () => ({ language: 'en', setLanguage: value => languages.push(value), t: translations.en }) },
    '../data/publicContent': { publicNavigation, secondaryNavigation },
    '../data/homepageFooter': { homepageFooter, homepageFooterGroups, homepageFooterLegal, homepageFooterLogo },
    '../data/homepageContact': { homepageContactAssets },
    './SiteContactValue': { default: () => null, SocialLinks: () => null }, '../styles/homepage-footer.css': {},
  }
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => { assert.ok(name in imports, name); return imports[name] }, document: doc, window: { matchMedia: () => ({ matches: reduced }), scrollTo: value => scrolls.push(value) }, IntersectionObserver: class { constructor(cb) { this.cb = cb; observer = this } observe() {} disconnect() { this.disconnected = true } } })
  const tree = exports.default()
  nodes(tree).find(node => node.props?.className === 'closing-top').props.onClick()
  assert.equal(scrolls[0].top, 0); assert.equal(scrolls[0].behavior, reduced ? 'instant' : 'smooth')
  assert.equal(focuses[0].preventScroll, true)
  targetPresent = false; nodes(tree).find(node => node.props?.className === 'closing-top').props.onClick(); assert.equal(scrolls.length, 1)
  nodes(tree).find(node => node.type === 'button' && node.props.lang === 'ar').props.onClick(); assert.equal(languages[0], 'ar')
  const dispose = effect()
  if (reduced) assert.equal(tweens.length, 0)
  else {
    observer.cb([{ isIntersecting: true }]); assert.ok(entrance.active)
    options.onComplete(); assert.ok(tweens.every(t => t.active))
    doc.hidden = true; listener(); assert.ok(tweens.every(t => !t.active))
    doc.hidden = false; observer.cb([{ isIntersecting: false }]); assert.ok(tweens.every(t => !t.active))
  }
  dispose(); assert.ok(reverted)
  if (!reduced) { assert.ok(observer.disconnected); assert.equal(listener, null) }
}
console.log('Homepage footer: EN/AR/RTL, safe existing routes/pending contacts, real lazy assets, language controls, accessible reduced-motion scroll-to-top and off-screen/visibility/GSAP cleanup passed. Browser layout not measured.')
