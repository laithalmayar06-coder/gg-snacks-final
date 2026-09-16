export type SiteLanguage = 'en' | 'ar'
export type SiteText = Record<SiteLanguage, string>
export type SocialPlatform = 'instagram' | 'tiktok' | 'x' | 'youtube' | 'snapchat' | 'linkedin'
export interface SiteContent {
  company: { brandName: SiteText; legalName: SiteText | null; city: SiteText; country: SiteText; shortTagline: SiteText; shortDescription: SiteText; longDescription: SiteText | null }
  contact: { whatsapp: string | null; email: string | null; phone: string | null; address: SiteText | null; mapsUrl: string | null; socialLinks: Record<SocialPlatform, string | null>; eyebrow: SiteText; heading: SiteText; intro: SiteText; body: SiteText }
  about: { eyebrow: SiteText; heading: Record<SiteLanguage, string[]>; subheading: SiteText | null; body: SiteText; supportingPoints: Record<SiteLanguage, string[]>; mediaStatus: SiteText; mediaCaption: SiteText }
  whyGG: { heading: SiteText; eyebrow: SiteText; intro: SiteText | null; cards: { title: SiteText; description: SiteText }[] }
  footer: { copyrightText: SiteText; locationLabel: SiteText; socialLabel: SiteText }
  hero: { headline: Record<SiteLanguage, string[]>; bottom: SiteText; origin: SiteText }
  seo: { defaultTitle: SiteText; defaultDescription: SiteText; defaultSocialPreviewImage: string | null }
}

// Existing marketing copy is temporary; unknown company facts remain null.
const company: SiteContent["company"] = {
  "brandName": {
    "en": "GG Snacks",
    "ar": "جي جي سناكس"
  },
  "legalName": null,
  "city": {
    "en": "Jeddah",
    "ar": "جدة"
  },
  "country": {
    "en": "Saudi Arabia",
    "ar": "المملكة العربية السعودية"
  },
  "shortTagline": {
    "en": "Bold flavor. Next-level crunch. Made for your kind of play.",
    "ar": "نكهة جريئة. قرمشة بمستوى جديد. على أصول اللعب."
  },
  "shortDescription": {
    "en": "GG Snacks is a snack brand based in Jeddah, Saudi Arabia, combining bold product identity with a gaming-inspired visual world.",
    "ar": "جي جي سناكس علامة سناك مقرها جدة، المملكة العربية السعودية، تجمع بين هوية منتجات جريئة وعالم بصري مستوحى من الألعاب."
  },
  "longDescription": null
}

export const siteContent: SiteContent = { company, ...{
  "contact": {
    "whatsapp": null,
    "email": null,
    "phone": null,
    "address": null,
    "mapsUrl": null,
    "socialLinks": {
      "instagram": null,
      "tiktok": null,
      "x": null,
      "youtube": null,
      "snapchat": null,
      "linkedin": null
    },
    "eyebrow": {
      "en": "CONTACT / GG",
      "ar": "تواصل / جي جي"
    },
    "heading": {
      "en": "GET IN TOUCH",
      "ar": "تواصل معنا"
    },
    "intro": {
      "en": "LET’S TALK GG.",
      "ar": "خلّينا نحكي جي جي."
    },
    "body": {
      "en": "For distribution, partnerships, or general inquiries, get in touch with the GG Snacks team.",
      "ar": "للتوزيع أو الشراكات أو الاستفسارات العامة، تواصل مع فريق جي جي سناكس."
    }
  },
  "about": {
    "eyebrow": {
      "en": "ABOUT / GG UNIVERSE",
      "ar": "من نحن / عالم جي جي"
    },
    "heading": {
      "en": [
        "MEET GG.",
        "ROOTED IN PLAY."
      ],
      "ar": [
        "تعرّف على جي جي.",
        "بروح اللعب."
      ]
    },
    "subheading": null,
    "body": company.shortDescription,
    "supportingPoints": {
      "en": [
        "BOLD FLAVORS",
        "DISTINCT PRODUCT WORLDS",
        "BUILT FOR THE GAME"
      ],
      "ar": [
        "نكهات جريئة",
        "عوالم منتجات مميزة",
        "مصممة لروح اللعب"
      ]
    },
    "mediaStatus": {
      "en": "COMING SOON",
      "ar": "قريبًا"
    },
    "mediaCaption": {
      "en": "A future look inside the GG world.",
      "ar": "نظرة قادمة إلى عالم جي جي."
    }
  },
  "whyGG": {
    "heading": {
      "en": "WHY GG",
      "ar": "لماذا جي جي؟"
    },
    "eyebrow": {
      "en": "BUILT DIFFERENT",
      "ar": "مصممة بشكل مختلف"
    },
    "intro": null,
    "cards": [
      {
        "title": {
          "en": "Bold Flavours",
          "ar": "نكهات جريئة"
        },
        "description": {
          "en": "Flavor with a personality of its own.",
          "ar": "نكهات تعبّر عن شخصية خاصة بها."
        }
      },
      {
        "title": {
          "en": "Quality First",
          "ar": "الجودة أولًا"
        },
        "description": {
          "en": "Our focus: care in the details, from the snack to the experience.",
          "ar": "اهتمامنا بالتفاصيل، من السناك إلى التجربة."
        }
      },
      {
        "title": {
          "en": "Made for Gamers",
          "ar": "صُممت للاعبين"
        },
        "description": {
          "en": "A visual language inspired by the world of play.",
          "ar": "لغة بصرية مستوحاة من عالم اللعب."
        }
      },
      {
        "title": {
          "en": "Real Value",
          "ar": "قيمة حقيقية"
        },
        "description": {
          "en": "Our aim: make every snack break feel worthwhile.",
          "ar": "هدفنا أن تكون كل استراحة سناك تجربة تستحق."
        }
      }
    ]
  },
  "footer": {
    "copyrightText": {
      "en": "© GG Snacks. All rights reserved.",
      "ar": "© جي جي سناكس. جميع الحقوق محفوظة."
    },
    "locationLabel": { en: `${company.city.en}, ${company.country.en}`, ar: `${company.city.ar}، ${company.country.ar}` },
    "socialLabel": {
      "en": "Social media",
      "ar": "وسائل التواصل"
    }
  },
  "hero": {
    "headline": {
      "en": [
        "LEVEL UP",
        "YOUR SNACK."
      ],
      "ar": [
        "ارتقِ بتجربتك",
        "مع السناك"
      ]
    },
    "bottom": {
      "en": "BIG FLAVOR. GOOD GAME.",
      "ar": "نكهة قوية. لعب على أصوله."
    },
    "origin": {
      "en": "FROM JEDDAH. FOR THE GAME.",
      "ar": "من جدة. لعشّاق اللعب."
    }
  },
  "seo": {
    "defaultTitle": {
      "en": "GG Snacks — Level up your snack",
      "ar": "جي جي سناكس — ارتقِ بتجربتك مع السناك"
    },
    "defaultDescription": {
      "en": "GG Snacks. Bold flavor. A whole new level. From Jeddah, Saudi Arabia.",
      "ar": "جي جي سناكس. نكهة جريئة ومستوى جديد من جدة، المملكة العربية السعودية."
    },
    "defaultSocialPreviewImage": null
  }
} }

export function getSiteTranslations(language: SiteLanguage) {
  const { company, contact, about, whyGG, footer, hero, seo } = siteContent
  return {
    brandName: company.brandName[language],
    description: company.shortTagline[language],
    universeDescription: about.body[language],
    universeLabel: about.eyebrow[language],
    universeHeadline: about.heading[language],
    universeIdentity: about.supportingPoints[language],
    universeMediaStatus: about.mediaStatus[language],
    universeMediaCaption: about.mediaCaption[language],
    contactTitle: contact.heading[language],
    contactLabel: contact.eyebrow[language],
    contactIntro: contact.intro[language],
    contactDescription: contact.body[language],
    whyTitle: whyGG.heading[language],
    whyLabel: whyGG.eyebrow[language],
    whyFeatures: whyGG.cards.map(card => ({ title: card.title[language], description: card.description[language] })),
    footerLocation: footer.locationLabel[language],
    footerCopyright: footer.copyrightText[language],
    headline: hero.headline[language],
    bottom: hero.bottom[language],
    origin: hero.origin[language],
    title: seo.defaultTitle[language],
    meta: seo.defaultDescription[language],
    location: language === "en" ? `${company.city.en} / ${company.country.en}`.toUpperCase() : `${company.city.ar} / ${company.country.ar}`,
  }
}
