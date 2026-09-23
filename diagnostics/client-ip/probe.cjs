const fs = require('node:fs'), path = require('node:path');
const endpoint = new URL(process.argv[2]);
if(endpoint.protocol !== 'https:' || endpoint.pathname !== '/functions/v1/ip-header-diagnostic' || endpoint.search || endpoint.username || endpoint.password) throw new Error('Use the isolated diagnostic HTTPS URL');
const token = process.env.IP_DIAGNOSTIC_TOKEN || fs.readFileSync(path.join(__dirname,'.env.local'),'utf8').split(/\r?\n/).find(line=>line.startsWith('IP_DIAGNOSTIC_TOKEN='))?.slice('IP_DIAGNOSTIC_TOKEN='.length).trim();
if(!token) throw new Error('Temporary diagnostic token missing');
const run = require('node:crypto').randomUUID();
const names = ['x-forwarded-for','x-real-ip','cf-connecting-ip'];
async function probe(header, value) {
 const headers = {'x-diagnostic-token':token,'x-diagnostic-run':run,'x-diagnostic-probe':value};
 if(header) headers[header]=value;
 const response=await fetch(endpoint,{method:'POST',headers,redirect:'error',signal:AbortSignal.timeout(20000)});
 if(response.status!==200) return { diagnostic_http_error: response.status };
 return response.json();
}
(async()=>{
 const baseline=await probe(null,'198.51.100.77');
 if(baseline.diagnostic_http_error) throw new Error('Baseline request rejected; no conclusion');
 const rows=[];
 for(const forged of names) for(const value of ['198.51.100.77','203.0.113.88']) {
  const result=await probe(forged,value), control=await probe(null,value);
  if(result.diagnostic_http_error || control.diagnostic_http_error) { console.log(forged + ': no usable header response; HTTP ' + (result.diagnostic_http_error || control.diagnostic_http_error)); continue; }
  for(const observed of names) {
   const before=baseline[observed], during=result[observed], after=control[observed];
   if(!before || !during || !after) throw new Error('Unexpected response; inconclusive');
   rows.push({forged,probe:value,observed,present:during.present,baselinePresent:before.present,baselineStable:before.present && after.present && before.value_tag===after.value_tag,changed:before.value_tag!==during.value_tag,forgedValuePresent:during.contains_probe,singleIP:during.single_ip});
  }
 }
 console.table(rows);
 for(const header of names) {
  const matches=rows.filter(row=>row.observed===header);
  const candidate=matches.length === 6 && matches.every(row=>row.present && row.baselinePresent && row.baselineStable && !row.changed && !row.forgedValuePresent && row.singleIP);
  console.log(`${header}: unchanged single-IP candidate in this run = ${candidate}`);
 }
 console.log('No raw addresses/tags printed. Observed resistance to these probes is not a universal trust guarantee.');
})().catch(error=>{console.error(error.message);process.exitCode=1});
