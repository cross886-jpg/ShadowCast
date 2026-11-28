// Internationalization (i18n) resource manager for Shadow Cast.
let currentLocale = 'ko';
let translations = {};

export const I18n = {
  getLocale() {
    return currentLocale;
  },

  async load(locale = 'ko') {
    currentLocale = locale;
    const response = await fetch(`./i18n/${locale}.json`);
    translations = await response.json();
    return translations;
  },

  t(key, fallback = '') {
    return translations[key] || fallback || key;
  }
};
