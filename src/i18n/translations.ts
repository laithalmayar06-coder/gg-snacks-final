import { getSiteTranslations } from '../data/siteContent'

export const translations = {
  en: {
    ...getSiteTranslations('en'),
    pageNotFound: 'PAGE NOT FOUND',
    pageLoading: 'Loading…',
    pageError: 'This page could not load. Please reload and try again.', pageRetry: 'Reload page',
    contactPhone: 'Phone',
    catalogueLabel: 'GG LOADOUT', catalogueTitle: 'CHOOSE YOUR SNACK.',
    catalogueDescription: 'Explore the GG Snacks product worlds and discover each family.',
    catalogueDescriptor: 'A distinct world in the GG Snacks lineup.', catalogueExplore: 'Explore', catalogueBack: 'Back to Products', catalogueRate: 'RATE THIS FLAVOR',
    catalogueInfo: 'Product information', catalogueInfoLabels: ['Package size', 'Ingredients', 'Nutrition', 'Product description'], catalogueInfoPending: 'Details to be confirmed.', catalogueNoFlavors: 'Flavor details coming soon.',
    ratingRateLimited: 'Please wait a minute before trying again. If the limit continues, try again later.',
    ratingSubmitting: 'Submitting...', ratingSubmitError: 'Something went wrong. Please try again.',
    ratingSaved: 'Your feedback has been saved.', ratingSubmitNote: 'Choose a rating to submit. Comments are optional (up to 1000 characters).',
    ratingSuccess: 'FEEDBACK RECEIVED', ratingThanks: 'Thanks for rating GG Snacks.', ratingNotFound: 'PRODUCT NOT FOUND', ratingBack: 'Back to home',
    ratingLabels: ['Very bad', 'Bad', 'Okay', 'Good', 'Excellent'], ratingChoose: 'Choose one rating',
    ratingLocalNote: 'Frontend preview: feedback stays on this page only. Nothing is sent or saved.',
      
    
    contactItemLabels: { whatsapp: 'WhatsApp', email: 'Email', location: 'Location', social: 'Social media' },
    contactPending: 'Details coming soon', contactFormTitle: 'CONTACT PREVIEW',
    contactFormNote: 'Visual preview only. Fields are read-only and sending is not available yet.',
    contactName: 'Name', contactReply: 'Email or phone', contactSubject: 'Subject', contactMessage: 'Message', contactSend: 'Send',
     footerNavigation: 'Footer navigation', footerLanguage: 'Language',
    footerSocialPending: 'Social links coming soon', 
    rateHeadline: ['PLAYED IT.', 'TASTED IT.', 'RATE IT.'],
    rateDescription: 'Scan the QR on your pack and share your experience in seconds.',
    rateSteps: 'SCAN → RATE → DONE', ratePreview: 'RATING PREVIEW',
    rateProduct: 'Product name', rateFlavor: 'Flavor placeholder', rateQuestion: 'HOW WAS YOUR SNACK?',
    rateComment: 'Optional comment', rateSubmit: 'SUBMIT',
    rateEmojiLabels: ['Very disappointed', 'Disappointed', 'Neutral', 'Happy', 'Loved it'],
    ratePreviewNote: 'Visual preview only. Ratings and pack QR codes are coming soon.',
     
    worldTitle: 'PRODUCT WORLDS', worldLoadout: 'CHOOSE YOUR LOADOUT', worldFamilies: 'Product families', worldFlavors: 'Flavors',
    worldPreview: 'PRODUCT PREVIEW', worldPlaceholder: 'Abstract product placeholder. Packaging image coming soon.', worldFlavorNote: 'Preview flavor names. Final flavors coming soon.',
    home: 'Home', products: 'Products', about: 'About', quality: 'Quality', distribution: 'Distribution', rate: 'Rate Your Snack', contact: 'Contact',
     
    
    explore: 'EXPLORE PRODUCTS', rateCta: 'RATE YOUR SNACK',
    stage: 'THE NEXT LEVEL IS LOADING', stageLabel: 'Product showcase coming soon', edition: 'GG / SNACKS',
     
    menu: 'Open navigation', close: 'Close navigation', skip: 'Skip to content',
    soon: 'Coming soon. This section is part of our next release.', dismiss: 'Dismiss notice',
     
  },
  ar: {
    ...getSiteTranslations('ar'),
    pageNotFound: '?????? ??? ??????',
    pageLoading: 'جارٍ التحميل…',
    pageError: 'تعذّر تحميل الصفحة. أعد تحميلها وحاول مرة أخرى.', pageRetry: 'إعادة تحميل الصفحة',
    contactPhone: 'الهاتف',
    catalogueLabel: 'مجموعة جي جي', catalogueTitle: 'اختر سناكك.',
    catalogueDescription: 'اكتشف عوالم منتجات جي جي سناكس وتعرّف على كل مجموعة.',
    catalogueDescriptor: 'عالم مميز ضمن مجموعة جي جي سناكس.', catalogueExplore: 'استكشف', catalogueBack: 'العودة إلى المنتجات', catalogueRate: 'قيّم هذه النكهة',
    catalogueInfo: 'معلومات المنتج', catalogueInfoLabels: ['حجم العبوة', 'المكونات', 'القيم الغذائية', 'وصف المنتج'], catalogueInfoPending: 'التفاصيل قيد التأكيد.', catalogueNoFlavors: 'تفاصيل النكهات قريبًا.',
    ratingRateLimited: 'يرجى الانتظار دقيقة قبل المحاولة مجددًا. إذا استمر الحد، حاول لاحقًا.',
    ratingSubmitting: 'جارٍ الإرسال...', ratingSubmitError: 'حدث خطأ. حاول مرة أخرى.',
    ratingSaved: 'تم حفظ تقييمك.', ratingSubmitNote: 'اختر تقييمًا للإرسال. التعليق اختياري (حتى 1000 حرف).',
    ratingSuccess: 'تم استلام تقييمك', ratingThanks: 'شكراً لتقييمك جي جي سناكس.', ratingNotFound: 'المنتج غير موجود', ratingBack: 'العودة للرئيسية',
    ratingLabels: ['سيئة جداً', 'سيئة', 'مقبولة', 'جيدة', 'ممتازة'], ratingChoose: 'اختر تقييمًا واحدًا',
    ratingLocalNote: 'معاينة للواجهة: يبقى تقييمك في هذه الصفحة فقط. لا يتم إرسال أي بيانات أو حفظها.',
      
    
    contactItemLabels: { whatsapp: 'واتساب', email: 'البريد الإلكتروني', location: 'الموقع', social: 'وسائل التواصل' },
    contactPending: 'التفاصيل قريبًا', contactFormTitle: 'معاينة نموذج التواصل',
    contactFormNote: 'معاينة مرئية فقط. الحقول للقراءة فقط والإرسال غير متاح حاليًا.',
    contactName: 'الاسم', contactReply: 'البريد أو رقم الهاتف', contactSubject: 'الموضوع', contactMessage: 'الرسالة', contactSend: 'إرسال',
     footerNavigation: 'روابط التذييل', footerLanguage: 'اللغة',
    footerSocialPending: 'روابط التواصل قريبًا', 
    rateHeadline: ['جرّبتها.', 'ذقتها.', 'قيّمها.'],
    rateDescription: 'امسح رمز QR الموجود على العبوة وشاركنا تقييمك خلال ثوانٍ.',
    rateSteps: 'امسح ← قيّم ← تم', ratePreview: 'معاينة التقييم',
    rateProduct: 'اسم المنتج', rateFlavor: 'اسم النكهة المؤقت', rateQuestion: 'كيف كانت تجربتك؟',
    rateComment: 'تعليق اختياري', rateSubmit: 'إرسال',
    rateEmojiLabels: ['غير راضٍ إطلاقًا', 'غير راضٍ', 'محايد', 'راضٍ', 'أعجبتني جدًا'],
    ratePreviewNote: 'معاينة مرئية فقط. التقييم ورموز QR على العبوات قريبًا.',
     
    worldTitle: 'عوالم المنتجات', worldLoadout: 'اختر مجموعتك', worldFamilies: 'عائلات المنتجات', worldFlavors: 'النكهات',
    worldPreview: 'معاينة المنتج', worldPlaceholder: 'مجسم تجريدي مؤقت للمنتج. صورة العبوة قريبًا.', worldFlavorNote: 'أسماء نكهات مؤقتة للمعاينة. النكهات النهائية قريبًا.',
    home: 'الرئيسية', products: 'المنتجات', about: 'من نحن', quality: 'الجودة', distribution: 'التوزيع', rate: 'قيّم منتجك', contact: 'تواصل معنا',
     
    
    explore: 'استكشف المنتجات', rateCta: 'قيّم منتجك',
    stage: 'المستوى التالي قادم', stageLabel: 'عرض المنتجات قريبًا', edition: 'جي جي / سناكس',
     
    menu: 'فتح القائمة', close: 'إغلاق القائمة', skip: 'انتقل إلى المحتوى',
    soon: 'قريبًا. هذا القسم ضمن الإصدار القادم.', dismiss: 'إغلاق الإشعار',
     
  },
}
export type Language = keyof typeof translations
export type NavKey = 'home' | 'products' | 'about' | 'quality' | 'distribution' | 'rate' | 'contact'
