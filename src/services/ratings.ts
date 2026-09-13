import { getFlavor } from '../data/products'
import type { Language } from '../i18n/translations'
import { getSupabase } from '../lib/supabase'

interface RatingInput {
  productSlug: string
  flavorSlug: string
  rating: number
  comment: string
  language: Language
}

export async function submitRating(input: RatingInput): Promise<void> {
  if (!getFlavor(input.productSlug, input.flavorSlug)) throw new Error('Invalid product or flavor')
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) throw new Error('Invalid rating')
  const comment = input.comment.trim()
  if (comment.length > 1000) throw new Error('Comment is too long')
  if (input.language !== 'en' && input.language !== 'ar') throw new Error('Invalid language')
  // No .select(): anonymous clients can insert but cannot read ratings.
  const { error } = await getSupabase().from('ratings').insert({
    product_slug: input.productSlug,
    flavor_slug: input.flavorSlug,
    rating: input.rating,
    comment: comment || null,
    language: input.language,
    source: 'qr',
  }).abortSignal(AbortSignal.timeout(15000))
  if (error) throw error
}
