const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const root=require('path').resolve(__dirname,'..');
function load(relative,globals={}){
 const exports={};const source=fs.readFileSync(root+'/'+relative,'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,module:{exports},console,URL,DOMException,...globals},{filename:relative});return exports;
}
const {productWorldThemes:worlds,WORLD_ROTATION_MS}=load('src/data/productWorldSelector.ts');
const {getWorldDelivery,getWorldThumbnail}=load('src/data/productWorldDelivery.ts');
assert.equal(WORLD_ROTATION_MS,5800);
const report=JSON.parse(fs.readFileSync(root+'/scripts/product-world-delivery-report.json'));
const delivered=new Set(report.flatMap(entry=>entry.variants.map(v=>'/'+v.path.replace(/^public\//,''))));
for(const world of worlds){
 assert.equal(world.href,'/products/'+world.id);
 for(const mobile of [false,true]){
  const d=getWorldDelivery(world,mobile);
  assert.equal(d.sources.length,mobile ? {'pop-g':3,trigger:4,loots:4,'x-stix':3}[world.id] : world.food.length+1);
  for(const src of d.sources){assert(delivered.has(src),src);assert(fs.existsSync(root+'/public'+src),src)}
  assert.equal(new Set(d.sources).size,d.sources.length);
  if(mobile){assert(d.food.every(f=>!f||f.slot!=='crumbs'));assert(d.sources.every(src=>!src.includes('crumbs')))}
  if(mobile&&world.id==='x-stix'){assert(d.food[0].src.endsWith('/sticks-scatter-mobile.webp'));assert.equal(d.food[1],null);assert(!d.sources.some(src=>src.includes('sticks-main')))}
 }
 assert(delivered.has(getWorldThumbnail(world)));
}
for(const entry of report){
 const source=fs.readFileSync(root+'/'+entry.source);
 assert.equal(require('crypto').createHash('sha256').update(source).digest('hex'),entry.sha256);
 for(const v of entry.variants){assert(v.losslessVisiblePixels);assert(v.transparentPixels>0);assert(v.width<=entry.width&&v.height<=entry.height);assert(v.bytes<entry.bytes)}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const requests=[];
 class ImageMock {
  constructor(){this.decoded=new Promise((done,fail)=>{this.finishDecode=done;this.failDecode=fail})}
  set src(value){this._src=value;requests.push(this)} get src(){return this._src}
  decode(){return this.decoded}
  load(){this.onload?.()}
  done(){this.load();this.finishDecode()}
 }
 const api=load('src/lib/productWorldImages.ts',{Image:ImageMock,document:{baseURI:'https://gg.test/'}});
 return {api,requests};
}
(async()=>{
 // Two requests at most; loads alone do not unlock a transition before decode.
 {
  const {api,requests}=harness();let complete=false;
  const work=api.prepareWorldImages(['/a','/b','/c']).then(()=>{complete=true});
  assert.equal(requests.length,2);requests[0].load();requests[1].load();await tick();assert(!complete);assert.equal(requests.length,2);
  requests[0].finishDecode();await tick();assert.equal(requests.length,3);
  requests[1].finishDecode();requests[2].done();await work;assert(complete);
  await api.prepareWorldImages(['/a','/b','/c']);assert.equal(requests.length,3);
 }
 // A manual selection advances before queued speculation; aborted preload stops chaining.
 {
  const {api,requests}=harness(),abort=new AbortController();
  const background=api.preloadWorldImages(['/next-a','/next-b','/next-c'],abort.signal);
  assert.equal(requests.length,1);
  const manual=api.prepareWorldImages(['/wanted-a','/wanted-b']);assert.equal(requests.length,2);
  abort.abort();requests[0].done();await tick();assert.equal(requests[2].src,'https://gg.test/wanted-b');
  requests[1].done();requests[2].done();await Promise.all([manual,background]);assert.equal(requests.length,3);
 }
 // Share and promote an in-flight speculative request instead of fetching it twice.
 {
  const {api,requests}=harness(),abort=new AbortController();
  const background=api.preloadWorldImages(['/shared'],abort.signal);
  const manual=api.prepareWorldImages(['/shared']);abort.abort();assert.equal(requests.length,1);assert.equal(requests[0].fetchPriority,'high');
  requests[0].done();await Promise.all([manual,background]);
 }
 // Failed decode can be retried, and abandoned scene images are not retained.
 {
  const {api,requests}=harness();const fail=api.prepareWorldImages(['/retry']);const rejected=assert.rejects(fail,/decode/);
  requests[0].load();requests[0].failDecode(new Error('decode'));await rejected;
  const retry=api.prepareWorldImages(['/retry']);assert.equal(requests.length,2);requests[1].done();await retry;
  const abort=new AbortController();abort.abort();await api.rememberWorldImage({src:'/abandoned',decode:()=>Promise.resolve()},abort.signal);
  const fresh=api.prepareWorldImages(['/abandoned']);assert.equal(requests.length,3);requests[2].done();await fresh;
  api.releaseWorldImages();const reload=api.prepareWorldImages(['/retry']);assert.equal(requests.length,4);requests[3].done();await reload;
 }
 console.log('PASS: four families/breakpoints, delivery paths, source hashes, alpha/pixel checks, decode gate, two-request limit, serial preloading, foreground priority, deduplication, cancellation and failure retry.');
})().catch(error=>{console.error(error);process.exitCode=1});
