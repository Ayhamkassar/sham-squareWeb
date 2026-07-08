import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode, useCallback } from 'react';
import { I18nManager } from 'react-native';
import { AR_TO_EN } from './dictionary';

export type Locale = 'ar' | 'en';

const STORAGE_KEY = 'sham_presto_locale';

interface LocaleContextValue {
  locale: Locale;
  isRtl: boolean;
  /** Translate an Arabic source string to English when locale is 'en'. */
  t: (arabicText: string) => string;
  toggleLocale: () => void;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const storage = {
  getItem: (key: string): Locale | null => {
    try { return (localStorage?.getItem(key) as Locale) ?? null; } catch { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage?.setItem(key, value); } catch { /* noop */ }
  },
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return storage.getItem(STORAGE_KEY) ?? 'ar';
  });

  useEffect(() => {
    storage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const applyRtl = useCallback((next: Locale) => {
    if (I18nManager.isRTL !== (next === 'ar')) {
      I18nManager.allowRTL(next === 'ar');
      I18nManager.forceRTL(next === 'ar');
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const isRtl = locale === 'ar';
    return {
      locale,
      isRtl,
      t: (arabicText: string) => (locale === 'en' ? AR_TO_EN[arabicText] ?? arabicText : arabicText),
      toggleLocale: () => {
        const next: Locale = locale === 'ar' ? 'en' : 'ar';
        setLocaleState(next);
        applyRtl(next);
      },
      setLocale: (l: Locale) => {
        setLocaleState(l);
        applyRtl(l);
      },
    };
  }, [locale, applyRtl]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
