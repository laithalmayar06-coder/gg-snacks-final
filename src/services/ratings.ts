import { getFlavor } from '../data/products'
import type { Language } from '../i18n/translations'
import { getSupabase } from '../lib/supabase'

export class RatingRateLimitError extends Error {}

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
  // Never fall back to direct inserts: only the server endpoint can accept ratings.
  const { data, error } = await getSupabase().functions.invoke('submit-rating', { body: {
    product_slug: input.productSlug,
    flavor_slug: input.flavorSlug,
    rating: input.rating,
    comment: comment || null,
    language: input.language,
    source: 'qr',
  }, signal: AbortSignal.timeout(15000) })
  if (error?.context?.status === 429) throw new RatingRateLimitError('Please wait before submitting again.')
  if (error) throw error
  if (data?.accepted !== true) throw new Error('Submission was not confirmed')
}
