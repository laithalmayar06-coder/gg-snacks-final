export const homepageFooter = {
  en: { tagline: 'FUEL YOUR GAME.', explore: 'Explore GG', information: 'Information', contact: 'Connect with GG', follow: 'Follow GG', top: 'Back to top' },
  ar: { tagline: 'زوّد لعبك بالطاقة.', explore: 'اكتشف جي جي', information: 'معلومات', contact: 'تواصل مع جي جي', follow: 'تابع جي جي', top: 'العودة إلى الأعلى' },
} as const

// Existing destinations only; retain feedback and business entry points.
export const homepageFooterGroups = [
  { key: 'explore', paths: ['/', '/products', '/about', '/find-gg', '/contact'] },
  { key: 'information', paths: ['/arena', '/tournaments', '/faq', '/feedback', '/business'] },
] as const
export const homepageFooterLegal = ['/privacy', '/terms'] as const
export const homepageFooterLogo = '/preview-assets/web/LOGO%20.PNG.png'
