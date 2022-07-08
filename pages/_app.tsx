import React from "react";
import type { ReactElement, ReactNode } from "react";
import { appWithTranslation } from "next-i18next";
import { ChakraProvider } from "@chakra-ui/react";
import type { NextPage } from "next";
import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import {
  ConfigContextProvider,
  AppApolloProvider,
  MapContextProvider,
  SettingsContextProvider,
} from "~/provider";

import { chakraTheme } from "~/theme";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development")
    console.log(chakraTheme);

  const getLayout = Component.getLayout || ((page) => page);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <AppApolloProvider>
        <ChakraProvider theme={chakraTheme}>
          <SettingsContextProvider
            frontendSettings={pageProps.frontendSettings}
          >
            <MapContextProvider>
              {getLayout(<Component {...pageProps} />)}
            </MapContextProvider>
          </SettingsContextProvider>
        </ChakraProvider>
      </AppApolloProvider>
    </ConfigContextProvider>
  );
}
export default appWithTranslation(MyApp);
