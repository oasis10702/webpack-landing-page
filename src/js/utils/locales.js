const { languages, i18nKey, defaultLanguage } = require('../../locales');

Object.keys(languages).forEach(lng =>
  localStorage.setItem(i18nKey, window.location.pathname.indexOf(lng) > 0 ? lng : defaultLanguage));
