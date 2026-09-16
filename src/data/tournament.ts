import type { SiteText } from './siteContent'
export const tournament = {
  // Month-only dates are confirmed; no fabricated day or live countdown target.
  startsAt: null as string | null,
  fields: [
    { id: 'game', label: { en: 'Game title', ar: 'اسم اللعبة' }, value: null },
    { id: 'prize', label: { en: 'Prize', ar: 'الجائزة' }, value: null },
    { id: 'rules', label: { en: 'Rules', ar: 'القواعد' }, value: null },
    { id: 'registration', label: { en: 'Registration details', ar: 'تفاصيل التسجيل' }, value: null },
    { id: 'stream', label: { en: 'Stream link', ar: 'رابط البث' }, value: null },
    { id: 'teams', label: { en: 'Accepted teams', ar: 'الفرق المقبولة' }, value: null },
    { id: 'schedule', label: { en: 'Schedule', ar: 'الجدول' }, value: null },
    { id: 'results', label: { en: 'Winners / results', ar: 'الفائزون / النتائج' }, value: null },
  ] as { id: string; label: SiteText; value: SiteText | null }[],
}
