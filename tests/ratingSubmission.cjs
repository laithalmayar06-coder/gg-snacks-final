const fs = require('node:fs')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const ts = require('typescript')
function compile(path, imports = {}) {
  const box = { exports: {}, AbortSignal, require: name => imports[name] }
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, box)
  return box.exports
}
const products = compile('src/data/products.ts')
let writes = []
let fail = false
const service = compile('src/services/ratings.ts', {
  '../data/products': products,
  '../lib/supabase': { getSupabase: () => ({ from: table => ({ insert: row => { writes.push({ table, row }); return { abortSignal: async () => ({ error: fail ? new Error('offline') : null }) } } }) }) },
})
;(async () => {
  const input = { productSlug: 'loots', flavorSlug: 'flavor-1', rating: 5, comment: '  hello  ', language: 'en' }
  await service.submitRating(input)
  assert.equal(writes[0].table, 'ratings')
  assert.equal(writes[0].row.comment, 'hello')
  assert.equal(writes[0].row.source, 'qr')
  assert.equal(input.comment, '  hello  ')
  await service.submitRating({ ...input, comment: '   ' })
  assert.equal(writes[1].row.comment, null)
  for (const invalid of [{ rating: 0 }, { rating: 6 }, { rating: 1.5 }, { comment: 'a'.repeat(1001) }, { productSlug: 'missing' }, { flavorSlug: 'missing' }, { language: 'xx' }]) {
    await assert.rejects(() => service.submitRating({ ...input, ...invalid }))
  }
  assert.equal(writes.length, 2)
  fail = true
  await assert.rejects(() => service.submitRating(input))
  assert.equal(input.comment, '  hello  ')
  console.log('Submission validation and failure checks passed (mocked database)')
})().catch(error => { console.error(error); process.exitCode = 1 })
