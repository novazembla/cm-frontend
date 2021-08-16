const path = require("path");

// TOOD: you should be able to set this via culturemap.js
module.exports = {
  i18n: {
    localeDetection: true,
    defaultLocale: "en",
    locales: ["de", "en"],
    localePath: path.resolve('./public/static/locales')
  },
};
