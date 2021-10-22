const { i18n } = require('./next-i18next.config');

const domain = (new URL(process.env.NEXT_PUBLIC_API_GRAPHQL_URL));

const domains = ["localhost"]
if (domain.host.split(":")[0] !== "localhost")
  domains.push(domain.host.split(":")[0]);

module.exports = {
  i18n,
  images: {
    domains,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push(
      {
        test: /\.svg$/,
        issuer: {
          and: [/\.(js|ts)x?$/]
        },
        use: ['@svgr/webpack'],
      }
    );
    return config
  },
};
