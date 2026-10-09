const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, requireMock = require, globals = {}, extra = '') {
  const source = fs.readFileSync(path.join(root, file), 'utf8') + extra;
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, module: { exports }, require: requireMock, console, AbortController, ...globals });
  return exports;
}
const data = load('src/data/productWorldSelector.ts');
const delivery = load('src/data/productWorldDelivery.ts');
const selection = load('src/lib/productWorldSelection.ts');
const worlds = data.productWorldThemes;
const tick = () => new Promise(resolve => setImmediate(resolve));

// Test the real component with deterministic hook, image-preparation and GSAP adapters.
// This exercises lifecycle/input wiring, not browser paint or layout performance.
function harness(width = 1440, reduced = false, language = 'en', options = {}) {
  const slots = [], pendingEffects = [], timelines = [], contexts = [], requests = [], timers = new Map();
  let cursor = 0, dirty = false, tree, owner, nextTimer = 0, mounted = true;
  const decoded = new Set(), decodes = new Map(), preloads = [], observers = [], mediaListeners = new Map(), pageListeners = new Map();
  const equal = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const hooks = {
    useRef(value) { const i = cursor++; return slots[i] ??= { current: value }; },
    useState(initial) {
      const i = cursor++;
      slots[i] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, value => {
        const next = typeof value === 'function' ? value(slots[i].value) : value;
        if (!Object.is(next, slots[i].value)) { slots[i].value = next; dirty = true; }
      }];
    },
    useMemo(fn, deps) {
      const i = cursor++;
      if (!equal(slots[i]?.deps, deps)) slots[i] = { value: fn(), deps };
      return slots[i].value;
    },
    useCallback(fn, deps) { return hooks.useMemo(() => fn, deps); },
  };
  function effect(fn, deps, layout) {
    const i = cursor++;
    if (!equal(slots[i]?.deps, deps)) {
      pendingEffects.push({ i, fn, layout });
      slots[i] = { ...slots[i], deps };
    }
  }
  hooks.useEffect = (fn, deps) => effect(fn, deps, false);
  hooks.useLayoutEffect = (fn, deps) => effect(fn, deps, true);
  const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: Symbol('fragment') };
  const document = { hidden: false, addEventListener: (name, fn) => pageListeners.set(name, fn), removeEventListener: name => pageListeners.delete(name) };
  const window = {
    matchMedia: query => ({ get matches() { return query.includes('reduced-motion') ? reduced : width <= 767; }, addEventListener: (name, fn) => mediaListeners.set(query, fn), removeEventListener: () => mediaListeners.delete(query) }),
    setTimeout: (fn, ms) => { const id = ++nextTimer; timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  const gsap = {
    utils: { selector: () => query => query },
    context(fn) {
      const context = { animations: [], reverted: false, killedWithoutRevert: false,
        revert() { this.reverted = true; this.animations.forEach(a => { a.killed = true; }); },
        kill(revert) { this.killedWithoutRevert = revert === false; this.animations.forEach(a => { a.killed = true; }); },
      };
      owner = context; fn(); owner = null; contexts.push(context); return context;
    },
    timeline(options) {
      const timeline = { calls: [], killed: false, done: false,
        to(target, vars, at) { this.calls.push({ target, vars, at }); return this; },
        fromTo(target, from, vars, at) { this.calls.push({ target, from, vars, at }); return this; },
        complete() { assert(!this.killed); this.done = true; options.onComplete(); },
      };
      timelines.push(timeline); owner.animations.push(timeline); return timeline;
    },
    to(target, vars) {
      const tween = { target, vars, killed: false, play() {}, pause() {} };
      owner.animations.push(tween); return tween;
    },
    set() {},
  };
  const imports = {
    react: hooks, 'react/jsx-runtime': jsx, gsap,
    'react-router': { Link: 'a' },
    '../i18n/LanguageContext': {}, './HomepageSections': {},
    '../data/productWorldSelector': data, '../data/productWorldDelivery': delivery,
    '../lib/productWorldSelection': selection,
    '../lib/productWorldImages': {
      areWorldImagesReady: sources => Boolean(options.readiness && sources.every(src => decoded.has(src))),
      prepareWorldImages: sources => options.readiness && sources.every(src => decoded.has(src)) ? Promise.resolve() : new Promise((resolve, reject) => requests.push({ sources, resolve, reject })),
      preloadWorldImages: (sources, signal) => options.readiness ? new Promise((resolve, reject) => preloads.push({ sources, signal, resolve, reject })) : Promise.resolve(),
      rememberWorldImage: async (image, signal) => { await image.decode(); if (!signal.aborted) decoded.add(image.src); },
      releaseWorldImages() { decoded.clear(); },
    },
    '../styles/world-portals.css': {},
  };
  const api = load('src/components/ProductWorlds.tsx', name => {
    assert(name in imports, name); return imports[name];
  }, { window, document, IntersectionObserver: class {
    constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  } }, '\nexport { WorldSelector };');
  const dom = { querySelector: () => null, querySelectorAll: query => {
    if (!options.readiness || !query.includes('.pw-background')) return [];
    const sources = new Set([data.worldCoreAssets.background, data.worldCoreAssets.hologram, ...delivery.getWorldDelivery(worlds[active()], width <= 767).sources]);
    return nodes().filter(n => n.type === 'img' && sources.has(n.props.src)).map(n => ({ src: n.props.src, decode() {
      if (decoded.has(this.src)) return Promise.resolve();
      if (!decodes.has(this.src)) {
        let resolve; const promise = new Promise(done => { resolve = done; }); decodes.set(this.src, { promise, resolve });
      }
      return decodes.get(this.src).promise;
    } }));
  } };
  function flush() {
    let turns = 0;
    do {
      assert(++turns < 30, 'Render loop'); dirty = false; cursor = 0;
      tree = api.WorldSelector({ worlds, language }); tree.props.ref.current = dom;
      const effects = pendingEffects.splice(0).sort((a, b) => Number(b.layout) - Number(a.layout));
      for (const item of effects) { slots[item.i].cleanup?.(); slots[item.i].cleanup = item.fn(); }
    } while (dirty);
  }
  function nodes(node = tree) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(nodes);
    if (typeof node.type === 'function') return nodes(node.type(node.props));
    return [node, ...(node.props?.children === undefined ? [] : nodes(node.props.children))];
  }
  const byClass = name => nodes().filter(n => n.props?.className?.split(' ').includes(name));
  const active = () => byClass('pw-selector').findIndex(n => n.props['aria-pressed']);
  const click = index => { byClass('pw-selector')[index].props.onClick(); flush(); };
  const next = () => { byClass('pw-arrows')[0].props.children[1].props.onClick(); flush(); };
  const complete = () => { timelines.at(-1).complete(); flush(); };
  async function settle(success = true) {
    const request = requests.shift(); assert(request, 'Expected pending image preparation');
    if (success) { request.sources.forEach(src => decoded.add(src)); request.resolve(); } else request.reject(new Error('decode failed'));
    await tick(); if (mounted) flush(); return request;
  }
  const flushAsync = async () => { await tick(); if (mounted) flush(); };
  async function readyCurrent() { for (const [src, d] of decodes) { decoded.add(src); d.resolve(); } decodes.clear(); await flushAsync(); }
  async function readyPreload(success = true) {
    const job = preloads.shift(); assert(job, 'Expected silent preload');
    if (success) { if (!job.signal.aborted) job.sources.forEach(src => decoded.add(src)); job.resolve(); } else job.reject(new Error('network failed'));
    await flushAsync(); return job;
  }
  function fireTimer() { assert.equal(timers.size, 1); const [id, timer] = [...timers][0]; assert.equal(timer.ms, 5800); timers.delete(id); timer.fn(); flush(); }
  function pause() { byClass('pw-pause')[0].props.onClick(); flush(); }
  function visibility(visible) { observers.find(o => o.options?.threshold).callback([{ isIntersecting: visible }]); flush(); }
  function pageVisibility(visible) { document.hidden = !visible; pageListeners.get('visibilitychange')?.(); flush(); }
  function resize(value) { width = value; mediaListeners.get('(max-width: 767px)')?.(); flush(); }
  function unmount() { mounted = false; for (const slot of slots) slot?.cleanup?.(); }
  flush();
  return { nodes, byClass, active, click, next, complete, settle, timelines, contexts, requests, timers, unmount, preloads, readyCurrent, readyPreload, fireTimer, pause, visibility, pageVisibility, resize, flushAsync };
}
(async () => {
  // Latest manual request wins; automated requests never replace it.
  const q = selection.createWorldSelection();
  assert(q.request(1)); assert(!q.request(2)); assert(!q.request(3));
  assert(!q.request(0, false)); assert.equal(q.requested, 3); assert.equal(q.takePending(), null);
  q.commit(1); q.finish(); assert.equal(q.takePending(), 3); assert(q.request(3));
  q.commit(3); q.finish(); assert(!q.request(3));

  // Input arriving between completion and the queue-draining render supersedes stale input.
  const race = selection.createWorldSelection();
  race.request(1); race.request(2); race.commit(1); race.finish();
  assert(!race.request(0, false)); assert(race.request(3));
  race.commit(3); race.finish(); assert.equal(race.takePending(), null);
  race.request(1); race.request(2); race.finish(); assert(!race.request(3));
  assert.equal(race.takePending(), null);

  for (const width of [320, 340, 390, 430, 768, 1440]) {
    for (const language of ['en', 'ar']) {
      const h = harness(width, false, language); h.complete();
      assert([...h.timers.values()].every(t => t.ms === 5800));
      for (const index of [1, 2, 3, 0]) {
        h.click(index); const request = await h.settle();
        assert.deepEqual([...request.sources], [...delivery.getWorldDelivery(worlds[index], width <= 767).sources]);
        assert.equal(h.active(), index); assert.equal(h.byClass('pw-environment-layer').length, 2);
        const tl = h.timelines.at(-1);
        const lights = tl.calls.filter(c => c.target.includes('data-world-light'));
        assert.equal(lights.length, 4);
        assert(lights.every(c => c.vars.duration === .7 && Object.keys(c.vars).every(k => ['opacity', 'duration'].includes(k))));
        assert(tl.calls.every(c => !Object.keys(c.vars).some(k => k.startsWith('--'))));
        assert.equal(tl.calls.find(c => c.from && c.target.endsWith('.pw-pack-reveal')).vars.duration, .65);
        assert.equal(tl.calls.find(c => c.from && c.target.endsWith('.pw-pack-reveal')).from.y, 18 * (width <= 767 ? .55 : 1));
        assert.equal(h.timelines.filter(t => !t.done && !t.killed).length, 1);
        for (const layer of h.byClass('pw-environment-layer')) {
          const theme = worlds.find(w => w.id === layer.props['data-world-light']);
          assert.equal(layer.props.style['--pw-accent'], theme.accent);
          assert.equal(layer.props.style['--pw-secondary'], theme.secondary);
        }
        const liveInfo = h.byClass('pw-info').find(n => !n.props.inert);
        assert(h.nodes(liveInfo).some(n => n.props.to === worlds[index].href));
        for (const n of h.nodes().filter(n => n.type === 'img')) assert(fs.existsSync(root + '/public' + n.props.src), n.props.src);
        h.complete(); assert.equal(h.byClass('pw-environment-layer').length, 1);
        assert.equal(h.byClass('pw-visual').length, 1); assert.equal(h.byClass('pw-hologram-energy').length, 1);
      }
      assert(h.contexts.some(c => c.killedWithoutRevert), 'Outgoing floats retain their pose');
      h.unmount(); assert(h.timelines.every(t => t.killed));
    }
  }
  // Inputs during loading and animation are retained without overlapping timelines.
  {
    const h = harness(); h.complete(); h.click(1); h.click(2); h.click(3);
    assert.equal(h.requests.length, 1); await h.settle(); assert.equal(h.active(), 1);
    h.click(0); h.click(2); h.complete();
    assert.equal(h.requests.length, 1); await h.settle(); assert.equal(h.active(), 2); h.complete();
    assert.equal(h.requests.length, 0); h.unmount();
  }
  // Rapid arrows advance from the latest requested destination, not stale displayed state.
  {
    const h = harness(); h.complete(); h.next(); h.next(); h.next();
    await h.settle(); h.complete(); await h.settle(); assert.equal(h.active(), 3); h.complete(); h.unmount();
  }
  // A failed load releases the guard and continues to the queued user destination.
  {
    const h = harness(); h.complete(); h.click(1); h.click(3); await h.settle(false);
    assert.equal(h.active(), 0); await h.settle(); assert.equal(h.active(), 3); h.complete(); h.unmount();
  }
  // Reduced motion still drains pending choices and never creates entrance/idle timelines.
  {
    const h = harness(390, true); h.click(1); h.click(2); await h.settle(); await h.settle();
    assert.equal(h.active(), 2); assert.equal(h.timelines.length, 0); assert.equal(h.byClass('pw-visual').length, 1); h.unmount();
  }
  // Async completion after unmount cannot start a new scene or timeline.
  {
    const h = harness(); h.complete(); h.click(1); const count = h.timelines.length;
    h.unmount(); await h.settle(); assert.equal(h.timelines.length, count);
  }
  // Cold scene, expired dwell and slow next-family decode: never show automatic loading.
  for (const width of [390, 1440]) {
    const h = harness(width, false, 'en', { readiness: true }); h.complete();
    const status = () => h.byClass('pw-status')[0].props.children;
    assert.equal(h.timers.size, 0); assert.equal(h.preloads.length, 0); assert.equal(status(), '');
    await h.readyCurrent(); assert.equal(h.timers.size, 1); assert.equal(h.preloads.length, 1);
    h.fireTimer(); assert.equal(h.active(), 0); assert.equal(h.requests.length, 0); assert.equal(status(), '');
    for (const index of [1, 2, 3, 0]) {
      const job = await h.readyPreload();
      assert.deepEqual([...job.sources], [...delivery.getWorldDelivery(worlds[index], width <= 767).sources]);
      assert.equal(h.active(), index); assert.equal(status(), ''); assert.equal(h.requests.length, 0);
      h.complete(); await h.flushAsync();
      if (index !== 0) h.fireTimer();
    }
    h.unmount();
  }
  // Early readiness does not shorten the existing dwell.
  {
    const h = harness(390, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent();
    await h.readyPreload(); assert.equal(h.active(), 0); assert.equal(h.timers.size, 1);
    h.fireTimer(); assert.equal(h.active(), 1); assert.equal(h.byClass('pw-status')[0].props.children, ''); h.complete(); h.unmount();
  }
  // Pause or loss of visibility while preparation finishes cannot cause a late auto-switch.
  for (const mode of ['pause', 'visibility', 'pageVisibility']) {
    const h = harness(390, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent(); h.fireTimer();
    if (mode === 'pause') h.pause(); else h[mode](false);
    const job = await h.readyPreload(); assert(job.signal.aborted); assert.equal(h.active(), 0); assert.equal(h.timers.size, 0);
    if (mode === 'pause') h.pause(); else h[mode](true);
    assert.equal(h.timers.size, 1); await h.readyPreload(); assert.equal(h.active(), 0);
    h.fireTimer(); assert.equal(h.active(), 1); h.complete(); h.unmount();
  }
  // Manual work takes priority during a silent wait; rapid choices still use the Phase 2 queue.
  {
    const h = harness(390, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent(); h.fireTimer();
    h.click(3); h.click(2); assert(h.preloads[0].signal.aborted);
    assert.equal(h.byClass('pw-status')[0].props.children, data.worldSelectorCopy.en.loading);
    await h.readyPreload(); assert.equal(h.active(), 0);
    await h.settle(); assert.equal(h.active(), 3); h.complete();
    await h.settle(); assert.equal(h.active(), 2); h.complete(); h.unmount();
  }
  // Warm manual selections do not flash loading feedback.
  {
    const h = harness(390, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent(); await h.readyPreload();
    h.click(1); assert.equal(h.byClass('pw-status')[0].props.children, '');
    await h.flushAsync(); assert.equal(h.active(), 1); assert.equal(h.requests.length, 0); h.complete(); h.unmount();
  }
  // A breakpoint change invalidates readiness for the old delivery profile.
  {
    const h = harness(1440, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent();
    h.resize(390); assert.equal(h.timers.size, 0); await h.readyPreload(); assert.equal(h.active(), 0);
    await h.readyCurrent(); const job = h.preloads[0]; assert(job.sources.every(src => src.includes('-mobile.webp')));
    h.fireTimer(); assert.equal(h.active(), 0); await h.readyPreload(); assert.equal(h.active(), 1); h.complete(); h.unmount();
  }
  // Speculative failure stays silent and does not consume manual retry capability.
  {
    const h = harness(390, false, 'en', { readiness: true }); h.complete(); await h.readyCurrent(); h.fireTimer();
    await h.readyPreload(false); assert.equal(h.active(), 0); assert.equal(h.byClass('pw-status')[0].props.children, '');
    h.click(1); await h.settle(); assert.equal(h.active(), 1); h.complete(); h.unmount();
  }
  {
    const h = harness(390, true, 'en', { readiness: true }); await h.readyCurrent();
    assert.equal(h.timers.size, 0); assert.equal(h.preloads.length, 0); h.click(1); await h.settle();
    assert.equal(h.active(), 1); assert.equal(h.timelines.length, 0); h.unmount();
  }
  console.log('Product Worlds transitions passed: four families, EN/AR, six viewport profiles, cold-scene readiness, silent slow preparation, 5.8s dwell, pause/visibility, warm manual selection, rapid clicks, breakpoint changes, failure recovery, reduced motion and cleanup (mocked lifecycle; not browser profiling).');
})().catch(error => { console.error(error); process.exitCode = 1; });
