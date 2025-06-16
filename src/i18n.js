import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
const basePath = '/route-dispatch';

i18n
    .use(Backend) // load translations
    .use(LanguageDetector) // detect user language
    .use(initReactI18next) // pass to react-i18next
    .init({
        fallbackLng: 'pt',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: `${basePath}/locales/{{lng}}/{{ns}}.json`
        },
    })

export default i18n
