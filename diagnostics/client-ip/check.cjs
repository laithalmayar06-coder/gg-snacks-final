const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript'), assert = require('node:assert/strict');
let handler;
const token = 'local-diagnostic-test-secret-32-characters';
const code = ts.transpileModule(fs.readFileSync('supabase/functions/ip-header-diagnostic/index.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{ exports:{},require,Response,TextEncoder,Uint8Array,crypto:require('node:crypto').webcrypto,Deno:{env:{get:()=>token},serve:callback=>{handler=callback}} });
const run='00000000-0000-0000-0000-000000000001';
const headers={'x-diagnostic-token':token,'x-diagnostic-run':run,'x-diagnostic-probe':'198.51.100.77'};
(async()=>{
 assert.equal((await handler(new Request('https://example.test',{method:'POST'}))).status,403);
 const baseline=await (await handler(new Request('https://example.test',{method:'POST',headers}))).json();
 for(const name of ['x-forwarded-for','x-real-ip','cf-connecting-ip']) {
  assert.equal(baseline[name].present,false);
  const result=await (await handler(new Request('https://example.test',{method:'POST',headers:{...headers,[name]:'198.51.100.77'}}))).json();
  assert.equal(result[name].present,true); assert.equal(result[name].matches_probe,true); assert.equal(result[name].contains_probe,true); assert.equal(result[name].single_ip,true);
  assert.equal(JSON.stringify(result).includes('198.51.100.77'),false);
  const changed=await (await handler(new Request('https://example.test',{method:'POST',headers:{...headers,[name]:'192.0.2.2'}}))).json();
  assert.notEqual(result[name].value_tag,changed[name].value_tag); assert.equal(changed[name].contains_probe,false);
 }
 console.log('Diagnostic local checks passed: authorization, presence, comparison and no raw addresses. These are not ingress observations.');
})().catch(error=>{console.error(error);process.exitCode=1});
