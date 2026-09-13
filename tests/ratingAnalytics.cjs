const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
const source = fs.readFileSync('src/data/ratingAnalytics.ts', 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const sandbox = { exports: {}, Intl, Date, Map }
vm.runInNewContext(code, sandbox)
const analytics = sandbox.exports
const rows = Array.from({ length: 6 }, (_, index) => ({
  id: String(index), product_slug: index < 3 ? 'loots' : 'trigger', flavor_slug: 'flavor-1',
  rating: index < 3 ? 5 : 2, comment: index === 0 ? 'hello' : ' ', language: index < 3 ? 'en' : 'ar',
  created_at: '2026-09-05T22:00:00Z',
}))
const stats = analytics.analyzeRatings(rows, new Date('2026-09-06T01:00:00Z'))
assert.equal(stats.total, 6)
assert.equal(stats.average, 3.5)
assert.equal(stats.comments, 1)
assert.equal(stats.today, 6)
assert.equal(stats.highest[0].key, 'loots/flavor-1')
assert.equal(stats.lowest[0].key, 'trigger/flavor-1')
assert.equal(analytics.filterRatings(rows, { ...analytics.emptyFilters, product: 'loots', language: 'en', from: '2026-09-06', to: '2026-09-06' }).length, 3)
assert.equal(analytics.analyzeRatings(rows.slice(0, 2)).highest.length, 0)
assert.equal(analytics.analyzeRatings(rows.map(row => ({ ...row, rating: 3 }))).highest.length, 0)
assert.equal(analytics.average([]), null)
assert.equal(stats.distribution[4].count, 3)
console.log('Analytics checks passed')
