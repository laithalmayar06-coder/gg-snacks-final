import { getStaffSupabase, getSupabase } from '../lib/supabase'
import { cmsPayload, validateCmsRow, type CmsRow, type CmsSection, type CmsTable } from './schema'

export async function getCmsRole(signal: AbortSignal): Promise<'admin' | 'viewer' | null> {
  const { data, error } = await getStaffSupabase().rpc('cms_staff_role').abortSignal(signal)
  if (error) throw new Error('CMS authorization is unavailable. Confirm migration 003 is installed and sign in again.')
  return data === 'admin' || data === 'viewer' ? data : null
}
export async function readCmsRows(table: CmsTable, staff: boolean, signal: AbortSignal): Promise<CmsRow[]> {
  const client = staff ? getStaffSupabase() : getSupabase()
  const rows: CmsRow[] = []
  for (let offset = 0; offset < 10000; offset += 1000) {
    const { data, error } = await client.from(table).select('*').order('id').range(offset, offset + 999).abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)]))
    if (error) throw new Error(`Unable to load ${table}. Check the connection, migration and permissions.`)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) return rows.sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0))
  }
  throw new Error('CMS result limit reached. Narrow the data set before continuing.')
}
export async function saveCmsRow(section: CmsSection, row: CmsRow, original: CmsRow | null): Promise<CmsRow> {
  if (Object.keys(validateCmsRow(section, row)).length) throw new Error('Correct the highlighted fields.')
  const client = getStaffSupabase()
  const payload = cmsPayload(section, row)
  const query = original
    ? client.from(section.table).update(payload).eq('id', original.id!).eq('updated_at', original.updated_at!)
    : client.from(section.table).insert(section.singleton ? { ...payload, id: 1 } : payload)
  const { data, error } = await query.select().abortSignal(AbortSignal.timeout(15000)).single()
  if (error || !data) throw new Error(error?.code === '23505' ? 'That slug or content key already exists.' : 'Save failed. Your permissions may have changed, or another editor saved this record. Reload and try again.')
  return data
}
export async function deleteStore(row: CmsRow): Promise<void> {
  const { data, error } = await getStaffSupabase().from('stores').delete().eq('id', row.id!).eq('updated_at', row.updated_at!).select('id').abortSignal(AbortSignal.timeout(15000))
  if (error || data?.length !== 1) throw new Error('Delete failed. Reload to check permissions or a newer version of this record.')
}
