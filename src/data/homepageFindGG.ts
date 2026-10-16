// Homepage teaser only. These decorative points are not retail location data.
export const homepageFindGG = {
  en: {
    label: '06 / FIND GG',
    headline: ['FIND GG', 'NEAR YOU.'],
    supporting: ['SAME GREAT SNACKS.', 'MORE PLACES SOON.'],
    description: 'Store availability is coming soon. Stay tuned.',
    soon: 'COMING SOON',
    geography: 'SAUDI ARABIA',
    mapAlt: 'Illustrated Saudi Arabia map. Decorative markers do not indicate confirmed retail locations.',
  },
  ar: {
    label: '06 / اعثر على جي جي',
    headline: ['اعثر على جي جي', 'بالقرب منك.'],
    supporting: ['نفس السناكس الرائعة.', 'في أماكن أكثر قريبًا.'],
    description: 'تفاصيل أماكن توفر جي جي قادمة قريبًا. ترقّبوا المزيد.',
    soon: 'قريبًا',
    geography: 'المملكة العربية السعودية',
    mapAlt: 'خريطة توضيحية للمملكة العربية السعودية. العلامات الزخرفية لا تشير إلى مواقع بيع مؤكدة.',
  },
} as const

// Encode the actual folder name; keep the supplied filenames and artwork intact.
const directory = '/section%206/'
export const homepageFindGGAssets = {
  atmosphere: { src: directory + 'find-gg-cinematic-background.webp', width: 2400, height: 1100 },
  fog: { src: directory + 'find-gg-clean-fog.png', width: 1600, height: 430 },
  map: { src: directory + 'find-gg-saudi-map.png', width: 883, height: 615 },
  bluePin: { src: directory + 'pin-blue.png', width: 129, height: 173 },
  purplePin: { src: directory + 'pin-purple.png', width: 112, height: 161 },
  blueRipple: { src: directory + 'ripple-blue.png', width: 127, height: 111 },
  purpleRipple: { src: directory + 'ripple-purple.png', width: 109, height: 102 },
} as const
