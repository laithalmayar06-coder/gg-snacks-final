const types = ['general','distribution','retail','partnership','creator','sponsorship','media']
export function validate(value: unknown) {
 if (!value || typeof value !== 'object' || Array.isArray(value)) return null
 const row = value as Record<string, unknown>
 const keys = ['name','company','email','phone','requestType','message','language']
 if (Object.keys(row).some(key => !keys.includes(key)) || keys.some(key => typeof row[key] !== 'string')) return null
 const v = Object.fromEntries(keys.map(key => [key, (row[key] as string).trim()]))
 if (!v.name || v.name.length > 200 || v.company.length > 200 || !v.message || v.message.length > 3000 || v.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return null
 if (!types.includes(v.requestType) || !['en','ar'].includes(v.language)) return null
 if (v.phone && (!/^\+?[\d\s().-]{7,30}$/.test(v.phone) || v.phone.replace(/\D/g,'').length < 7 || v.phone.replace(/\D/g,'').length > 15)) return null
 if (Object.values(v).some(text => /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))) return null
 return { name: v.name, company: v.company || null, email: v.email, phone: v.phone || null, enquiry_type: v.requestType, message: v.message, language: v.language }
}
export async function readBody(request: Request) {
 if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json' || !request.body) throw new Error('Invalid body')
 const reader = request.body.getReader()
 const chunks: Uint8Array[] = []
 let size = 0
 const timer = setTimeout(() => { void reader.cancel().catch(() => {}) }, 10000)
 try {
  for (;;) {
   const { done, value } = await reader.read()
   if (done) break
   size += value.byteLength
   if (size > 24576) { await reader.cancel(); throw new Error('Body too large') }
   chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown
 } finally { clearTimeout(timer); reader.releaseLock() }
}