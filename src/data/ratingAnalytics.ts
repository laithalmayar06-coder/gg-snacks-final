import type { RatingRow } from '../services/dashboardRatings'

export interface RatingFilters { product: string; flavor: string; score: string; language: string; from: string; to: string }
export const emptyFilters: RatingFilters = { product: '', flavor: '', score: '', language: '', from: '', to: '' }
const jeddahDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' })
export function dayKey(date: string | null): string {
  if (!date || Number.isNaN(Date.parse(date))) return ''
  const parts = jeddahDate.formatToParts(new Date(date))
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}
export function filterRatings(rows: RatingRow[], filters: RatingFilters): RatingRow[] {
  return rows.filter(row => (!filters.product || row.product_slug === filters.product) &&
    (!filters.flavor || row.flavor_slug === filters.flavor) && (!filters.score || row.rating === Number(filters.score)) &&
    (!filters.language || (row.language ?? 'unknown') === filters.language) &&
    (!filters.from || dayKey(row.created_at) >= filters.from) && (!filters.to || (!!dayKey(row.created_at) && dayKey(row.created_at) <= filters.to)))
}
export function average(rows: RatingRow[]): number | null {
  return rows.length ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length : null
}
export function groupRatings(rows: RatingRow[], by: 'product' | 'flavor'): Map<string, RatingRow[]> {
  const groups = new Map<string, RatingRow[]>()
  for (const row of rows) {
    const key = by === 'product' ? row.product_slug : `${row.product_slug}/${row.flavor_slug}`
    const group = groups.get(key)
    if (group) group.push(row)
    else groups.set(key, [row])
  }
  return groups
}
export function analyzeRatings(rows: RatingRow[], now = new Date()) {
  const today = dayKey(now.toISOString())
  const eligible = [...groupRatings(rows, 'flavor')].filter(([, group]) => group.length >= 3)
    .map(([key, group]) => ({ key, count: group.length, average: average(group)! })).sort((a, b) => b.average - a.average || a.key.localeCompare(b.key))
  const canRank = eligible.length >= 2 && eligible[0].average !== eligible[eligible.length - 1].average
  return {
    total: rows.length, average: average(rows), comments: rows.filter(row => row.comment?.trim()).length,
    today: rows.filter(row => dayKey(row.created_at) === today).length,
    products: groupRatings(rows, 'product'),
    distribution: [1, 2, 3, 4, 5].map(score => ({ score, count: rows.filter(row => row.rating === score).length })),
    highest: canRank ? eligible.filter(item => item.average === eligible[0].average) : [],
    lowest: canRank ? eligible.filter(item => item.average === eligible[eligible.length - 1].average) : [],
  }
}
