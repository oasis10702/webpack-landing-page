const HtmlWebpackPlugin = require('html-webpack-plugin');
const { languages } = require('../locales');
const RobotstxtPlugin = require('robotstxt-webpack-plugin').default;
const CreateFileWebpack = require('create-file-webpack');
const { createSitemap } = require('./sitemap');

const getHtmlPlugins = (htmlMaps, locale, flavorConfig, devMode) =>
  htmlMaps.map(
    htmlMap =>
      new HtmlWebpackPlugin({
        filename: getLocation(htmlMap, locale, flavorConfig).filename,
        template: htmlMap.template,
        templateParameters: getFlattenJson({
          ...locale,
          ...flavorConfig,
          ...getLocation(htmlMap, locale, flavorConfig),
          isProd: flavorConfig.FLAVOR === 'prod'
        }),
        minify: devMode
          ? {}
          : {
              removeAttributeQuotes: true,
              collapseWhitespace: true,
              html5: true,
              minifyCSS: true,
              removeComments: true,
              removeEmptyAttributes: true
            }
      })
  );

const getLocation = (htmlMap, locale, flavorConfig) => {
  const defaultLng = 'en-US';
  const lngHref = lang => (lang === defaultLng ? '' : `/${lang}`);
  const routePath = path => (path ? `${path}/` : '');
  const alternate = Object.keys(languages).map(lang => ({
    hreflang: lang,
    href: `${lngHref(lang)}/${routePath(htmlMap.path)}`
  }));
  return {
    PUBLIC_URL_INTL: `${flavorConfig.PUBLIC_URL}${lngHref(locale.lang)}`,
    pathname: {
      value: routePath(htmlMap.path),
      canonical: alternate.find(o => o.hreflang === locale.lang),
      alternate
    },
    filename: `${locale.lang === defaultLng ? '.' : locale.lang}/${htmlMap.path}/index.html`
  };
};

const getFlattenJson = originJson => {
  const flattenJson = {};
  const flatJson = (json, str) => {
    Object.keys(json).forEach(k => {
      const newKey = str ? `${str}.${k}` : k;
      const value = json[k];
      if (typeof value !== 'string') {
        flatJson(value, newKey);
      }
      flattenJson[newKey] = json[k];
    });
  };
  flatJson(originJson);
  return { ...flattenJson, ...originJson };
};

const getRobotsPlugins = (PUBLIC_URL, flavor) => {
  const robotsOption = {
    policy: [
      {
        userAgent: '*',
        [flavor === 'prod' ? 'allow' : 'disallow']: '/'
      }
    ]
  };

  if (flavor === 'prod') {
    robotsOption.sitemap = [`${PUBLIC_URL}/sitemap.xml`];
  }
  return new RobotstxtPlugin(robotsOption);
};

const getSitemapPlugin = (buildPath, PUBLIC_URL, flavor) => {
  if (flavor !== 'prod') {
    return null;
  }

  return new CreateFileWebpack({
    path: buildPath,
    fileName: 'sitemap.xml',
    content: createSitemap(PUBLIC_URL, languages).toString()
  });
};

module.exports = {
  getHtmlPlugins,
  getRobotsPlugins,
  getSitemapPlugin
};
