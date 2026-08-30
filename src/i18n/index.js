import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

export const LANG_STORAGE_KEY = 'md_admin_lang';
export const RTL_LANGS = ['ar'];

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'en';
}

export function applyDirection(lng) {
  const dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
  } catch {
    // ignore write failures (private browsing, etc.)
  }
});

applyDirection(i18n.language);

export default i18n;
