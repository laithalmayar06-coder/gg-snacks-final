import type { SiteText } from './siteContent'
const text = (en: string, ar: string): SiteText => ({ en, ar })
export const publicNavigation = [
  { path: '/', label: text('Home', 'الرئيسية') },
  { path: '/products', label: text('Products', 'المنتجات') },
  { path: '/arena', label: text('GG Arena', 'جي جي أرينا') },
  { path: '/tournaments', label: text('Tournaments', 'البطولات') },
  { path: '/find-gg', label: text('Find GG', 'أين تجد جي جي') },
  { path: '/about', label: text('About GG', 'عن جي جي') },
  { path: '/contact', label: text('Contact', 'تواصل معنا') },
]
export const secondaryNavigation = [
  { path: '/feedback', label: text('Feedback', 'شاركنا رأيك') },
  { path: '/business', label: text('Business Enquiries', 'استفسارات الأعمال') },
  { path: '/faq', label: text('FAQ', 'الأسئلة الشائعة') },
  { path: '/privacy', label: text('Privacy', 'الخصوصية') },
  { path: '/terms', label: text('Terms', 'الشروط') },
]
export const publicPaths = ['/arena', '/tournaments', '/find-gg', '/feedback', '/business', '/contact', '/faq', '/privacy', '/terms', '/about'] as const
export type PublicPath = typeof publicPaths[number]
export const pageTitles: Record<PublicPath, SiteText> = {
  '/arena': text('GG ARENA', 'جي جي أرينا'),
  '/tournaments': text('GG TOURNAMENTS', 'بطولات جي جي'),
  '/find-gg': text('FIND GG', 'أين تجد جي جي'),
  '/feedback': text('YOUR FEEDBACK MATTERS TO US', 'رأيك يهمنا'),
  '/business': text('LET’S BUILD SOMETHING TOGETHER', 'لنبنِ شيئًا معًا'),
  '/contact': text('GET IN TOUCH', 'تواصل معنا'),
  '/faq': text('YOUR QUESTIONS, ANSWERED', 'إجابات عن أسئلتك'),
  '/privacy': text('PRIVACY POLICY', 'سياسة الخصوصية'),
  '/terms': text('TERMS & CONDITIONS', 'الشروط والأحكام'),
  '/about': text('THIS IS GG', 'هذا هو جي جي'),
}
export const pageCopy = {
  en: {
    soon: 'Coming soon', overview: 'GG / EXPLORE', choose: 'Choose an option',
    family: 'Product family', flavour: 'Flavour', feedbackIntro: 'Choose your snack and flavour to open its rating page.',
    previewFlavours: 'Flavour names are preview placeholders until the final range is confirmed.', continue: 'CONTINUE TO RATING', noFlavours: 'No active flavours are available for this family yet.',
    city: 'City', district: 'District', allCities: 'All cities', allDistricts: 'All districts', search: 'SEARCH STORES',
    sampleStores: 'Demo directory — sample listings only. These are not confirmed stockists.', results: 'Store results', empty: 'No stores match your selection. Try another city or district.', online: 'Visit online store', map: 'Open map link', sample: 'Sample listing', onlineTitle: 'Online stores',
    name: 'Name', company: 'Company', email: 'Email', phone: 'Phone (optional)', requestType: 'Request type', message: 'Message',
    formNote: 'Form preview: check your details locally. Nothing is sent or saved.', check: 'CHECK ENQUIRY',
    checked: 'Your details pass the form checks. Nothing has been sent or saved; sending will be available later.',
    invalid: 'Please correct the highlighted fields.', required: 'Please complete this field.', invalidEmail: 'Enter a valid email address.', invalidPhone: 'Enter a phone number using 7–15 digits.', tooLong: 'This field is too long.',
    contactIntro: 'Contact details and social channels will be listed here once confirmed.',
    about: 'About GG', aboutPending: 'This section is being prepared. Confirmed brand details will be shared here.',
    faqNote: 'Initial guidance. More product and company answers will be added when confirmed.',
    legalPending: 'This page is a placeholder. The final document is not available yet.', updated: 'Last updated', updatePending: 'Not published',
    privacyBody: 'The final privacy policy will be published here when available.', termsBody: 'The final terms and conditions will be published here when available.',
    eventDetails: 'EVENT DETAILS', datePending: 'The exact tournament date will be announced later.',
  },
  ar: {
    soon: 'قريبًا', overview: 'جي جي / اكتشف', choose: 'اختر من القائمة',
    family: 'عائلة المنتج', flavour: 'النكهة', feedbackIntro: 'اختر السناك والنكهة للانتقال إلى صفحة التقييم.',
    previewFlavours: 'أسماء النكهات مؤقتة للمعاينة حتى تأكيد المجموعة النهائية.', continue: 'المتابعة إلى التقييم', noFlavours: 'لا توجد نكهات متاحة لهذه العائلة بعد.',
    city: 'المدينة', district: 'الحي', allCities: 'كل المدن', allDistricts: 'كل الأحياء', search: 'ابحث عن المتاجر',
    sampleStores: 'دليل تجريبي — بيانات نموذجية فقط وليست متاجر بيع مؤكدة.', results: 'نتائج المتاجر', empty: 'لا توجد متاجر مطابقة. جرّب مدينة أو حيًا آخر.', online: 'زيارة المتجر الإلكتروني', map: 'فتح رابط الخريطة', sample: 'بيانات نموذجية', onlineTitle: 'المتاجر الإلكترونية',
    name: 'الاسم', company: 'الشركة', email: 'البريد الإلكتروني', phone: 'الهاتف (اختياري)', requestType: 'نوع الطلب', message: 'الرسالة',
    formNote: 'نموذج للمعاينة: تحقق من بياناتك محليًا. لن تُرسل أو تُحفظ أي معلومات.', check: 'تحقق من الاستفسار',
    checked: 'اجتازت بياناتك التحقق. لم يُرسل أو يُحفظ أي شيء؛ ستتوفر خدمة الإرسال لاحقًا.',
    invalid: 'يرجى تصحيح الحقول الموضحة.', required: 'يرجى تعبئة هذا الحقل.', invalidEmail: 'أدخل بريدًا إلكترونيًا صالحًا.', invalidPhone: 'أدخل رقم هاتف من 7 إلى 15 رقمًا.', tooLong: 'هذا الحقل أطول من المسموح.',
    contactIntro: 'سنضيف معلومات التواصل والقنوات الاجتماعية بعد تأكيدها.',
    about: 'عن جي جي', aboutPending: 'هذا القسم قيد الإعداد. سنشارك تفاصيل العلامة المؤكدة هنا.',
    faqNote: 'إرشادات أولية. سنضيف إجابات أخرى عن المنتجات والشركة بعد تأكيدها.',
    legalPending: 'هذه صفحة مؤقتة. الوثيقة النهائية غير متاحة بعد.', updated: 'آخر تحديث', updatePending: 'لم تُنشر بعد',
    privacyBody: 'ستُنشر سياسة الخصوصية النهائية هنا عند توفرها.', termsBody: 'ستُنشر الشروط والأحكام النهائية هنا عند توفرها.',
    eventDetails: 'تفاصيل الفعالية', datePending: 'سنعلن موعد البطولة الدقيق لاحقًا.',
  },
} as const
// Unapproved sections intentionally remain empty rather than inventing company facts.
export const aboutSections = [
  { id: 'story', title: text('Brand Story', 'قصة العلامة'), body: null },
  { id: 'vision', title: text('Vision', 'الرؤية'), body: null },
  { id: 'mission', title: text('Mission', 'الرسالة'), body: null },
  { id: 'values', title: text('Values', 'القيم'), body: null },
] satisfies { id: string; title: SiteText; body: SiteText | null }[]
// FINAL LEGAL COPY REQUIRED BEFORE PUBLIC LAUNCH
export const legalContent: Record<'privacy' | 'terms', { lastUpdated: string | null; body: SiteText | null }> = {
  privacy: { lastUpdated: null, body: null }, terms: { lastUpdated: null, body: null },
}
