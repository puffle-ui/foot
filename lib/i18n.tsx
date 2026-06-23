'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Lang = 'en' | 'ar';

const translations = {
  en: {
    tagline: 'Live Football',
    allMatches: 'All Matches',
    liveNow: 'Live Now',
    today: 'TODAY',
    tomorrow: 'TOMORROW',
    in2days: 'IN 2 DAYS',
    in3days: 'IN 3 DAYS',
    match: 'match',
    matches: 'matches',
    noMatches: 'No matches available',
    checkBack: 'Check back soon',
    upNext: 'Up Next',
    fullTime: 'Full Time',
    ft: 'FT',
    watchLive: 'WATCH LIVE',
    viewMatch: 'VIEW MATCH',
    watch: 'Watch',
    vs: 'VS',
    watchLiveHeading: 'WATCH LIVE',
    connecting: 'Connecting to stream…',
    streamUnavailable: 'Stream unavailable — try another server above',
    playerHint: 'HD 1 starts muted — tap unmute. If a server stalls, switch above.',
    footer: 'ONADA — FIFA World Cup 2026 Live',
  },
  ar: {
    tagline: 'كرة القدم المباشرة',
    allMatches: 'كل المباريات',
    liveNow: 'مباشر الآن',
    today: 'اليوم',
    tomorrow: 'غدًا',
    in2days: 'بعد يومين',
    in3days: 'بعد ٣ أيام',
    match: 'مباراة',
    matches: 'مباريات',
    noMatches: 'لا توجد مباريات متاحة',
    checkBack: 'تحقق مرة أخرى قريبًا',
    upNext: 'التالي',
    fullTime: 'انتهت المباراة',
    ft: 'انتهت',
    watchLive: 'شاهد مباشرة',
    viewMatch: 'عرض المباراة',
    watch: 'شاهد',
    vs: 'ضد',
    watchLiveHeading: 'شاهد البث المباشر',
    connecting: 'جاري الاتصال بالبث…',
    streamUnavailable: 'البث غير متوفر — جرّب خادمًا آخر بالأعلى',
    playerHint: 'يبدأ البث صامتًا — اضغط لتشغيل الصوت. إذا توقف الخادم، بدّل بالأعلى.',
    footer: 'أونادا — كأس العالم فيفا ٢٠٢٦ مباشر',
  },
} as const;

export type Dict = Record<keyof (typeof translations)['en'], string>;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

function applyLang(l: Lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'ar' || stored === 'en') {
      setLangState(stored);
      applyLang(stored);
    } else {
      applyLang('en');
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('lang', l);
    applyLang(l);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
