export const homepageContact = {
  en: {
    label: '07 / CONTACT', headline: ["LET’S TALK", 'GG.'],
    description: 'For distribution, partnerships, or general inquiries, get in touch with the GG Snacks team.',
    connect: 'LET’S CONNECT', title: 'SEND US A MESSAGE',
    note: "Have a question? Fill out the form and we'll get back to you soon.",
    name: 'Full Name', email: 'Email Address', requestType: 'Subject', message: 'Your Message', send: 'SEND MESSAGE',
    categories: ['General Enquiries', 'Distribution', 'Partnerships', 'Sponsorships', 'Media'],
  },
  ar: {
    label: '07 / تواصل معنا', headline: ['خلّنا', 'نتواصل.'],
    description: 'للتوزيع والشراكات والاستفسارات العامة، يسعد فريق جي جي سناكس بالتواصل معك.',
    connect: 'لنبقَ على تواصل', title: 'أرسل لنا رسالة',
    note: 'هل لديك سؤال؟ املأ النموذج وسنرد عليك قريبًا.',
    name: 'الاسم الكامل', email: 'البريد الإلكتروني', requestType: 'الموضوع', message: 'رسالتك', send: 'إرسال الرسالة',
    categories: ['استفسارات عامة', 'التوزيع', 'الشراكات', 'الرعاية', 'الإعلام'],
  },
} as const

// Existing submit-enquiry categories; no new backend types.
export const homepageContactSubjects = ['general', 'distribution', 'partnership', 'sponsorship', 'media'] as const
const directory = '/section%207/'
export const homepageContactAssets = {
  background: { src: directory + 'contact-signal-background.webp', width: 2400, height: 1350 },
  halo: { src: directory + 'web/contact-signal-halo.webp', width: 1450, height: 950 },
  platform: { src: directory + 'web/contact-neon-platform.webp', width: 1320, height: 700 },
  fog: { src: directory + 'web/contact-fog-overlay.webp', width: 1672, height: 941 },
  envelopes: { src: directory + 'web/contact-hologram-envelopes.webp', width: 800, height: 600 },
} as const
