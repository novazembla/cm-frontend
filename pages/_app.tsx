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
  if (typeof window !== "undefined") console.log(chakraTheme);

  const getLayout = Component.getLayout || ((page) => page);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
      <Head>
      <link rel="shortcut icon" href="/img/reddot.png" />
      <link rel="icon" type="image/png" href="/img/reddot.png" sizes="16x16" />
      <link rel="icon" type="image/png" href="/img/reddot.png" sizes="32x32" />
      </Head>
      <AppApolloProvider>
        <ChakraProvider theme={chakraTheme}>
          <SettingsContextProvider>
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
