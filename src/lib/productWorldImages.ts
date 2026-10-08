type Priority = 'high' | 'low'
type Job = {
  src: string
  priority: Priority
  signal?: AbortSignal
  image?: HTMLImageElement
  promise: Promise<void>
  resolve: () => void
  reject: (error: Error) => void
}

// At most two preparations run together; next-family preloading schedules one at a time.
const MAX_IN_FLIGHT = 2
const MAX_READY_IMAGES = 24
const ready = new Map<string, HTMLImageElement>()
const pending = new Map<string, Job>()
const queue: Job[] = []
let inFlight = 0
const absolute = (src: string) => new URL(src, document.baseURI).href

function retain(src: string, image: HTMLImageElement) {
  ready.delete(src)
  ready.set(src, image)
  while (ready.size > MAX_READY_IMAGES) ready.delete(ready.keys().next().value!)
}

function drain() {
  while (inFlight < MAX_IN_FLIGHT && queue.length) {
    const urgent = queue.findIndex(job => job.priority === 'high')
    const [job] = queue.splice(urgent < 0 ? 0 : urgent, 1)
    if (job.signal?.aborted && job.priority === 'low') {
      pending.delete(job.src)
      job.reject(new DOMException('Preload cancelled', 'AbortError'))
      continue
    }
    inFlight++
    const image = new Image()
    job.image = image
    image.decoding = 'async'
    image.fetchPriority = job.priority
    let finished = false
    const finish = (error?: Error) => {
      if (finished) return
      finished = true
      image.onload = null; image.onerror = null
      pending.delete(job.src)
      inFlight--
      if (error) job.reject(error)
      else { retain(job.src, image); job.resolve() }
      drain()
    }
    image.onload = () => { image.decode().then(() => finish(), () => finish(new Error('Product world image could not decode'))) }
    image.onerror = () => finish(new Error('Product world image unavailable'))
    image.src = job.src
  }
}

function prepare(src: string, priority: Priority, signal?: AbortSignal): Promise<void> {
  const key = absolute(src)
  const cached = ready.get(key)
  if (cached) { retain(key, cached); return Promise.resolve() }
  const existing = pending.get(key)
  if (existing) {
    if (priority === 'high') {
      existing.priority = 'high'
      existing.signal = undefined
      if (existing.image) existing.image.fetchPriority = 'high'
      drain()
    }
    return existing.promise
  }
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((done, fail) => { resolve = done; reject = fail })
  const job: Job = { src: key, priority, signal, promise, resolve, reject }
  pending.set(key, job)
  queue.push(job)
  drain()
  return promise
}

export function prepareWorldImages(sources: string[]) {
  return Promise.all([...new Set(sources)].map(src => prepare(src, 'high'))).then(() => undefined)
}

export async function preloadWorldImages(sources: string[], signal: AbortSignal) {
  for (const src of new Set(sources)) {
    if (signal.aborted) return
    await prepare(src, 'low', signal)
  }
}

// Reuse images already decoded by the visible scene rather than preparing them again.
export async function rememberWorldImage(image: HTMLImageElement, signal: AbortSignal) {
  await image.decode()
  if (signal.aborted) return
  const src = image.currentSrc || image.src
  if (src) retain(absolute(src), image)
}

export function releaseWorldImages() {
  ready.clear()
}
