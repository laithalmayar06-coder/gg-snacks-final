import { getSupabase } from '../lib/supabase'
import type { EnquiryValues } from '../data/enquiries'
export async function submitEnquiry(values: EnquiryValues, language: 'en' | 'ar') {
 const { data, error } = await getSupabase().functions.invoke('submit-enquiry', {
  body: { ...values, language }, signal: AbortSignal.timeout(20000),
 })
 if (error || data?.accepted !== true) throw new Error('Submission was not confirmed')
}