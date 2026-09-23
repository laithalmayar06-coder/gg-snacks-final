const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript'), assert = require('node:assert/strict')
function compile(path) { return ts.transpileModule(fs.readFileSync(path,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText }
const validation = { exports: {} }
vm.runInNewContext(compile('supabase/functions/submit-enquiry/validation.ts'), { exports: validation.exports, TextDecoder, Uint8Array, setTimeout, clearTimeout })
const { validate, readBody } = validation.exports
const valid = { name: 'Test', company: '', email: 'test@example.test', phone: '', requestType: 'general', message: 'Hello', language: 'en' }
let handler, writes = [], fail = false
vm.runInNewContext(compile('supabase/functions/submit-enquiry/index.ts'), {
 exports: {}, Request, Response, AbortSignal,
 Deno: { env: { get: key => ({ ENQUIRIES_ALLOWED_ORIGINS: 'https://gg-snacks-final.vercel.app', SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'server-only-test-key' })[key] }, serve: callback => { handler = callback } },
 require: name => name === './validation.ts' ? validation.exports : { createClient: () => ({ from: table => {
  assert.equal(table,'enquiries')
  return { insert: row => ({ abortSignal: async () => { if (fail) return { error: {} }; writes.push(row); return { error: null } } }) }
 } }) },
})
const request = body => new Request('https://example.test', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://gg-snacks-final.vercel.app' }, body: JSON.stringify(body) })
async function main() {
 for (const language of ['en','ar']) for (const requestType of ['general','distribution','retail','partnership','creator','sponsorship','media']) {
  const response = await handler(request({ ...valid, requestType, language }))
  assert.equal(response.status,201)
  assert.deepEqual(await response.json(), { accepted: true })
 }
 assert.equal(writes.length,14)
 assert.equal(writes[0].company,null)
 for (const body of [null, [], {}, {...valid,email:'broken@'}, {...valid,message:'x'.repeat(3001)}, {...valid,name:''}, {...valid,requestType:'unknown'}, {...valid,language:'fr'}, {...valid,status:'resolved'}, {...valid,phone:'bad'}, {...valid,message:'\u0000'}, {...valid,message:42}]) {
  assert.equal(validate(body),null)
  assert.equal((await handler(request(body))).status,400)
 }
 assert.equal((await handler(new Request('https://example.test', { method:'POST',headers:{'content-type':'application/json'},body:'{'}))).status,400)
 await assert.rejects(() => readBody(request({...valid,message:'x'.repeat(25000)})))
 assert.equal((await handler(request({...valid,message:'x'.repeat(25000)}))).status,400)
 assert.equal(writes.length,14)
 assert.equal((await handler(new Request('https://example.test'))).status,405)
 assert.equal((await handler(new Request('https://example.test',{method:'OPTIONS',headers:{origin:'https://evil.test'}}))).status,403)
 fail = true
 assert.equal((await handler(request(valid))).status,503)
 const sql = fs.readFileSync('supabase/migrations/006_enquiries.sql','utf8')
 assert.match(sql,/enable row level security/i)
 assert.match(sql,/revoke all on public.enquiries from public, anon, authenticated/i)
 assert.match(sql,/grant update \(status\) on public.enquiries to authenticated/i)
 assert.match(sql,/for select to authenticated[\s\S]*in \('admin','viewer'\)[\s\S]*'aal2'/i)
 assert.match(sql,/for update to authenticated[\s\S]*= 'admin'[\s\S]*'aal2'/i)
 assert.ok(!/grant (insert|delete) on public.enquiries to (anon|authenticated)/i.test(sql))
 // Exercise the form submit handler with a deferred network request: rapid clicks cannot send twice.
 const formModule = { exports: {} }
 let calls = 0, finish
 const refValues = [], states = []
 let ri = 0, si = 0
 const react = {
  useRef: initial => refValues[ri++] ?? (refValues[ri - 1] = { current: initial }),
  useState: initial => {
   const index = si++
   if (!(index in states)) states[index] = initial && typeof initial === 'object' && 'name' in initial ? { ...valid } : initial
   return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
  },
 }
 function loadPlain(path) { const result = { exports: {} }; vm.runInNewContext(compile(path), { exports: result.exports }); return result.exports }
 const dependencies = {
  react,
  'react/jsx-runtime': require('react/jsx-runtime'),
  '../services/enquiries': { submitEnquiry: async () => { calls++; await new Promise(resolve => { finish = resolve }) } },
  '../i18n/LanguageContext': { useLanguage: () => ({ language: 'en' }) },
  '../data/publicContent': { pageCopy: { en: {} } },
  '../data/enquiries': loadPlain('src/data/enquiries.ts'),
  '../data/enquiryCopy': loadPlain('src/data/enquiryCopy.ts'),
 }
 const source = ts.transpileModule(fs.readFileSync('src/components/EnquiryForm.tsx','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
 vm.runInNewContext(source, { exports: formModule.exports, require: name => dependencies[name], requestAnimationFrame: callback => callback() })
 let form = formModule.exports.default({})
 const first = form.props.onSubmit({ preventDefault() {} })
 await form.props.onSubmit({ preventDefault() {} })
 assert.equal(calls,1)
 finish(); await first
 si = 0; ri = 0; form = formModule.exports.default({})
 await form.props.onSubmit({ preventDefault() {} })
 assert.equal(calls,1, 'Confirmed enquiry cannot be resubmitted from the same form')
 console.log('Enquiries: valid EN/AR categories, optional company, malformed/email/size validation, methods/CORS, persistence failures and policy structure passed. Live RLS requires SQL test.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })