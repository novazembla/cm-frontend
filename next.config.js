const { i18n } = require("./next-i18next.config");
const withImages = require("next-images");
const execSync = require("child_process").execSync;

const domain = new URL(process.env.NEXT_PUBLIC_API_URL);

const domains = ["localhost"];
if (domain.host.split(":")[0] !== "localhost")
  domains.push(domain.host.split(":")[0]);

const lastCommitCommand = "git rev-parse HEAD";

console.log(
  `Initializing next.js with build id ${execSync(lastCommitCommand)
    .toString()
    .trim()}`
);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(
  withImages({
    async generateBuildId() {
      return execSync(lastCommitCommand).toString().trim();
    },
    i18n,
    images: {
      domains,
    },
    productionBrowserSourceMaps: true,
    experimental: {
      scrollRestoration: true,
    },
    headers: [
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ],

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // config.infrastructureLogging = {
      //   appendOnly: true,
      //   level: "verbose",
      // };
      // config.module.rules.push(
      //   {
      //     test: /\.svg$/,
      //     issuer: {
      //       and: [/\.(js|ts)x?$/]
      //     },
      //     use: ['@svgr/webpack'],
      //   }
      // );
      return config;
    },
  })
);
