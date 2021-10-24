const path = require("path");

// TOOD: you should be able to set this via culturemap.js
module.exports = {
  i18n: {
    localeDetection: true,
    defaultLocale: "de",
    locales: ["de", "en"],
    localePath: path.resolve('./public/locales')
  },
};
