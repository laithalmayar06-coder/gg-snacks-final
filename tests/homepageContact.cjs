const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
function moduleFrom(file, imports = {}, globals = {}) {
 const exports = {}
 vm.runInNewContext(compile(file), { exports, require: name => {
  assert.ok(name in imports, 'Unexpected dependency: ' + name)
  return imports[name]
 }, requestAnimationFrame: fn => fn(), ...globals })
 return exports
}
const data = moduleFrom('src/data/homepageContact.ts')
const enquiries = moduleFrom('src/data/enquiries.ts')
const copy = moduleFrom('src/data/enquiryCopy.ts')
const publicCopy = moduleFrom('src/data/publicContent.ts')
let language = 'en'
let submit = async () => { throw Error('No live submissions allowed') }
function formModule(hooks = React) {
 return moduleFrom('src/components/EnquiryForm.tsx', {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'),
  '../services/enquiries': { submitEnquiry: (...args) => submit(...args) },
  '../data/enquiryCopy': copy, '../data/publicContent': publicCopy,
  '../data/enquiries': enquiries, '../i18n/LanguageContext': { useLanguage: () => ({ language }) },
 }).default
}
function homeModule(Form, hooks = React, gsap = {}, globals = {}) {
 return moduleFrom('src/components/HomepageContact.tsx', {
  react: hooks, 'react/jsx-runtime': require('react/jsx-runtime'), gsap,
  '../i18n/LanguageContext': { useLanguage: () => ({ language, t: {
   contactItemLabels: { whatsapp: 'WhatsApp', email: 'Email', location: 'Location', social: 'Social' }, contactPhone: 'Phone',
  } }) },
  '../cms/CmsProvider': { useCms: () => ({ contact_settings: [] }) },
  '../data/siteContent': { siteContent: { contact: { phone: '' } } },
  '../data/contact': { contactItems: ['whatsapp', 'email', 'location', 'social'] },
  '../data/homepageContact': data,
  './SiteContactValue': () => React.createElement('span', null, 'Configured channel'),
  './EnquiryForm': Form, '../styles/homepage-contact.css': {},
 }, globals).default
}
const escape = s => s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/"/g, '&quot;')
for (language of ['en', 'ar']) {
 const html = renderToStaticMarkup(React.createElement(homeModule(formModule())))
 assert.match(html, /id="contact"/)
 assert.ok(html.includes('dir="' + (language === 'ar' ? 'rtl' : 'ltr') + '"'))
 const c = data.homepageContact[language]
 for (const key of ['label', 'description', 'connect', 'title', 'note', 'name', 'email', 'requestType', 'message', 'send']) assert.ok(html.includes(escape(c[key])), key)
 for (const label of c.categories) assert.ok(html.includes(label))
 assert.equal((html.match(/<form /g) || []).length, 1)
 assert.equal((html.match(/aria-controls="signal-enquiry-requestType"/g) || []).length, 5)
 for (const field of ['name', 'email', 'requestType', 'message']) {
  assert.ok(html.includes('for="signal-enquiry-' + field + '"'))
  assert.match(html, new RegExp('<(?:input|select|textarea)[^>]*id="signal-enquiry-' + field + '"[^>]*required=""'))
 }
 assert.ok(!html.includes('signal-enquiry-phone') && !html.includes('signal-enquiry-company'))
 assert.ok(!html.includes('preview.jpg') && !html.includes('approved-design-reference'))
 assert.ok(!/[\uFFFD]/u.test(html))
 for (const asset of Object.values(data.homepageContactAssets)) {
  assert.ok(html.includes(asset.src)); const bytes = fs.readFileSync('public' + decodeURIComponent(asset.src))
  if (asset.src.endsWith('.png')) { assert.equal(bytes.readUInt32BE(16), asset.width); assert.equal(bytes.readUInt32BE(20), asset.height) }
 }
 assert.equal((html.match(/loading="lazy"/g) || []).length, 5)
}
// Small deterministic React state harness: network is mocked throughout.
function hooks() {
 const state=[],refs=[]; let si=0,ri=0,effect
 return { api: {
  useState(initial) { const i=si++; if(!(i in state))state[i]=initial; return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next}] },
  useRef(initial) { const i=ri++; return refs[i] ||= { current: initial } },
  useLayoutEffect(fn) { effect=fn },
 }, render(Component, props={}) {si=0;ri=0;return Component(props)}, effect:()=>effect() }
}
function nodes(node) { if(!node || typeof node!=='object')return []; return [node,...React.Children.toArray(node.props?.children).flatMap(nodes)] }
function byName(tree,name) {return nodes(tree).find(n=>n.props?.name===name)}
async function main() {
 for(language of ['en','ar']) for(const id of data.homepageContactSubjects) {
  const fh=hooks(), hh=hooks(), Form=formModule(fh.api), Home=homeModule(Form,hh.api)
  let parent=hh.render(Home)
  const category=nodes(parent).filter(n=>n.type==='button')[data.homepageContactSubjects.indexOf(id)]
  category.props.onClick()
  parent=hh.render(Home)
  let props=nodes(parent).find(n=>n.type===Form).props
  assert.equal(props.signalHub.subject,id)
  assert.equal(nodes(parent).filter(n=>n.type==='button' && n.props['aria-pressed']).length,1)
  let form=fh.render(Form,props)
  assert.equal(byName(form,'requestType').props.value,id)
  // Subject select and external category share the same state.
  byName(form,'requestType').props.onChange({target:{value:'media'}})
  parent=hh.render(Home);props=nodes(parent).find(n=>n.type===Form).props
  assert.equal(props.signalHub.subject,'media')
  props.signalHub.onSubjectChange(id);parent=hh.render(Home);props=nodes(parent).find(n=>n.type===Form).props
  form=fh.render(Form,props)
  let calls=[],finish,reject
  submit=(values,lang)=>{calls.push({values,lang});return new Promise((a,b)=>{finish=a;reject=b})}
  await form.props.onSubmit({preventDefault(){}})
  assert.equal(calls.length,0,'Empty fields never send')
  form=fh.render(Form,props)
  for(const [name,value] of Object.entries({name:'Synthetic test',email:'invalid',message:'Synthetic message'}))byName(form,name).props.onChange({target:{value}})
  form=fh.render(Form,props);await form.props.onSubmit({preventDefault(){}})
  assert.equal(calls.length,0,'Invalid email never sends')
  form=fh.render(Form,props);byName(form,'email').props.onChange({target:{value:'test@example.test'}})
  form=fh.render(Form,props)
  const pending=form.props.onSubmit({preventDefault(){}})
  await form.props.onSubmit({preventDefault(){}})
  assert.equal(calls.length,1,'Duplicate in-flight send blocked')
  assert.equal(calls[0].values.requestType,id);assert.equal(calls[0].lang,language)
  assert.equal(calls[0].values.company,'');assert.equal(calls[0].values.phone,'')
  parent=hh.render(Home);assert.ok(nodes(parent).filter(n=>n.type==='button').every(n=>n.props.disabled))
  reject(Error('Mocked failure'));await pending
  form=fh.render(Form,props)
  assert.ok(renderToStaticMarkup(form).includes(copy.enquiryCopy[language].failure))
  parent=hh.render(Home);assert.ok(nodes(parent).filter(n=>n.type==='button').every(n=>!n.props.disabled))
  const retry=form.props.onSubmit({preventDefault(){}});finish();await retry
  form=fh.render(Form,props);assert.ok(renderToStaticMarkup(form).includes(copy.enquiryCopy[language].success))
  await form.props.onSubmit({preventDefault(){}});assert.equal(calls.length,2,'Confirmed submission cannot send again')
 }

 // Mobile category scroll is conditional, header-aware, and never focuses/submits.
 for (language of ['en','ar']) for (const width of [320,340,375,767,768,1440]) for (const reduced of [false,true]) {
  const h=hooks(), calls=[]
  let panelTop=650
  const panel={getBoundingClientRect:()=>({top:panelTop,height:620}),focus(){throw Error('Category must not focus the form')}}
  const header={getBoundingClientRect:()=>({height:64})}
  const root={querySelector:()=>panel,closest:()=>({querySelector:()=>header})}
  const window={
   innerHeight:700,scrollY:200,
   matchMedia:query=>({matches:query.includes('max-width')?width<=767:reduced}),
   getComputedStyle:()=>({position:'sticky',top:'0px'}),
   scrollTo:options=>calls.push(options),
  }
  const Home=homeModule(()=>null,{...h.api,useRef:()=>({current:root})},{},{window})
  let tree=h.render(Home)
  nodes(tree).find(n=>n.type==='button').props.onClick()
  tree=h.render(Home)
  assert.equal(nodes(tree).find(n=>n.type==='button').props['aria-pressed'],true)
  assert.equal(calls.length,width<=767?1:0,'Desktop does not scroll')
  if(width<=767) {
   assert.equal(calls[0].top,774)
   assert.equal(calls[0].behavior,reduced?'instant':'smooth')
   panelTop=110
   nodes(tree).find(n=>n.type==='button').props.onClick()
   assert.equal(calls.length,1,'Already readable form does not jump')
  }
  // Subject control changes directly, without a form submission.
  const formNode=nodes(tree).find(n=>n.props?.signalHub)
  assert.equal(formNode.props.signalHub.subject,'general')
  const terminal=nodes(tree).findIndex(n=>n.props?.className==='signal-terminal')
  const mobileChannels=nodes(tree).findIndex(n=>n.props?.className==='signal-mobile-channels')
  assert.ok(mobileChannels>terminal,'Mobile channels follow the form in reading/tab order')
 }
 for(const reduced of [true,false]) {
  const h=hooks();let observer,cleanup,reverted=false,options
  const tweens=[]
  const tween=()=>({state:'paused',play(){this.state='playing'},pause(){this.state='paused'}})
  const entrance={...tween(),from(target,vars){assert.ok(!('filter' in vars));return this}}
  const doc={hidden:false,listener:null,addEventListener(_,fn){this.listener=fn},removeEventListener(){this.listener=null}}
  const gsap={
   matchMedia:()=>({add(query,fn){assert.equal(query,'(prefers-reduced-motion: no-preference)');if(!reduced)cleanup=fn()},revert(){reverted=true;cleanup?.()}}),
   utils:{selector:()=>s=>s},
   to(target,vars){assert.ok(!('filter' in vars));assert.equal(vars.paused,true);const t=tween();tweens.push(t);return t},
   timeline(o){options=o;return entrance},
  }
  const Home=homeModule(()=>null,{...h.api,useRef:()=>({current:{}})},gsap,{document:doc,IntersectionObserver:class{constructor(cb){this.cb=cb;observer=this}observe(){}disconnect(){this.disconnected=true}}})
  h.render(Home);const dispose=h.effect()
  if(reduced)assert.equal(tweens.length,0)
  else {
   observer.cb([{isIntersecting:true}]);assert.equal(entrance.state,'playing')
   options.onComplete();assert.ok(tweens.every(t=>t.state==='playing'))
   doc.hidden=true;doc.listener();assert.ok(tweens.every(t=>t.state==='paused'))
   doc.hidden=false;observer.cb([{isIntersecting:false}]);assert.ok(tweens.every(t=>t.state==='paused'))
  }
  dispose();assert.ok(reverted);if(!reduced){assert.ok(observer.disconnected);assert.equal(doc.listener,null)}
 }
 console.log('Signal Hub: EN/AR/RTL, five asset paths/dimensions, four required fields, all five category/subject mappings, mobile scroll/header offsets/no focus/desktop no-scroll, validation, pending/duplicate guards, failure/retry, confirmed success, reduced motion and lifecycle cleanup passed. Network mocked; no live enquiry sent.')
}
main().catch(e=>{console.error(e);process.exitCode=1})
