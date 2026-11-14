import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import km from './locales/km'

function persistedLanguage() {
  try {
    const raw = localStorage.getItem('smartpos.app.v1')
    if (!raw) return 'en'
    const parsed = JSON.parse(raw)
    const language = parsed?.state?.language
    return language === 'km' ? 'km' : 'en'
  } catch {
    return 'en'
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
  },
  lng: persistedLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'km'],
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n
