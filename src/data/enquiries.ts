export const requestTypes = [
  { id: 'general', label: { en: 'General Enquiry', ar: 'استفسار عام' } },
  { id: 'distribution', label: { en: 'Distribution', ar: 'التوزيع' } },
  { id: 'retail', label: { en: 'Supply / Retail', ar: 'التوريد / التجزئة' } },
  { id: 'partnership', label: { en: 'Business Partnership', ar: 'شراكة أعمال' } },
  { id: 'creator', label: { en: 'Creator Collaboration', ar: 'تعاون مع صناع المحتوى' } },
  { id: 'sponsorship', label: { en: 'Sponsorship / Tournament', ar: 'رعاية / بطولة' } },
  { id: 'media', label: { en: 'Media Enquiry', ar: 'استفسار إعلامي' } },
]
export interface EnquiryValues { name: string; company: string; email: string; phone: string; requestType: string; message: string }
export type EnquiryField = keyof EnquiryValues
export type EnquiryError = 'required' | 'invalidEmail' | 'invalidPhone' | 'tooLong'
export const emptyEnquiry: EnquiryValues = { name: '', company: '', email: '', phone: '', requestType: '', message: '' }
export function validateEnquiry(values: EnquiryValues, business: boolean): Partial<Record<EnquiryField, EnquiryError>> {
  const errors: Partial<Record<EnquiryField, EnquiryError>> = {}
  const required: EnquiryField[] = business ? ['name', 'email', 'requestType', 'message'] : ['name', 'email', 'message']
  for (const key of required) if (!values[key].trim()) errors[key] = 'required'
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'invalidEmail'
  if (values.phone.trim() && !/^\+?[\d\s().-]{7,30}$/.test(values.phone.trim())) errors.phone = 'invalidPhone'
  const digits = values.phone.replace(/\D/g, '')
  if (values.phone.trim() && (digits.length < 7 || digits.length > 15)) errors.phone = 'invalidPhone'
  if (business && !requestTypes.some(type => type.id === values.requestType)) errors.requestType = 'required'
  for (const key of Object.keys(values) as EnquiryField[]) if (values[key].length > (key === 'message' ? 3000 : key === 'email' ? 254 : 200)) errors[key] = 'tooLong'
  return errors
}
