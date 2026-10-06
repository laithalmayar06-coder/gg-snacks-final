export interface RatingPayload { product_slug: string; flavor_slug: string; rating: number; comment: string | null; language: string }
export function validateRating(value: unknown): RatingPayload | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (Object.keys(row).some(key => !['product_slug','flavor_slug','rating','comment','language','source'].includes(key))) return null
  if (typeof row.product_slug !== 'string' || !['loots','trigger','x-stix','pop-g'].includes(row.product_slug)) return null
  if (typeof row.flavor_slug !== 'string' || !(
    ['flavor-1','flavor-2','flavor-3'].includes(row.flavor_slug)
    || (row.product_slug === 'trigger' && row.flavor_slug === 'flavor-4')
  )) return null
  if (typeof row.rating !== 'number' || !Number.isInteger(row.rating) || row.rating < 1 || row.rating > 5) return null
  if (row.comment !== undefined && row.comment !== null && (typeof row.comment !== 'string' || row.comment.length > 1000 || row.comment.includes('\0'))) return null
  if (row.language !== 'en' && row.language !== 'ar') return null
  if (row.source !== undefined && row.source !== 'qr') return null
  return { product_slug: row.product_slug, flavor_slug: row.flavor_slug, rating: row.rating, comment: typeof row.comment === 'string' ? row.comment.trim() || null : null, language: row.language }
}

export async function readSmallJson(request: Request): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('format')
  if (!request.body || Number(request.headers.get('content-length') ?? 0) > 8192) throw new Error('size')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []; let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.length
      if (length > 8192) throw new Error('size')
      chunks.push(value)
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
  const body = new Uint8Array(length); let offset = 0
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(body))
}
