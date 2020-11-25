const sm = require('sitemap');
const { routes } = require('../config/router');

const createSitemap = (PUBLIC_URL, languages) => {
  const urls = Object.keys(routes).map(key => ({
    url: `/${routes[key].path}`,
    changefreq: routes[key].changefreq,
    priority: routes[key].priority,
    links: Object.keys(languages).map(lang => ({
      lang,
      url: lang === 'en-US' ? `${PUBLIC_URL}/${routes[key].path}` : `${PUBLIC_URL}/${lang}/${routes[key].path}`,
    })),
  }));
  const sitemap = sm.createSitemap({
    hostname: PUBLIC_URL,
    urls,
  });
  return sitemap;
};

module.exports = {
  createSitemap,
};
