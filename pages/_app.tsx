import React from "react";
import type { ReactElement, ReactNode } from "react";
import { appWithTranslation } from "next-i18next";
import { ChakraProvider } from "@chakra-ui/react";
import type { NextPage } from "next";
import "../styles/globals.scss";
import type { AppProps } from "next/app";

import { LayoutFull } from "~/components/app";

import {
  ConfigContextProvider,
  AppApolloProvider,
  MapContextProvider,
  QuickSearchContextProvider,
  MenuButtonContextProvider,
  SettingsContextProvider,
  ScrollStateContextProvider,
  MainContentContextProvider,
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

  const getLayout =
    Component.getLayout ||
    ((page) => (
      <ScrollStateContextProvider>
        <MainContentContextProvider>
          <QuickSearchContextProvider>
            <MenuButtonContextProvider>
              <LayoutFull>{page}</LayoutFull>
            </MenuButtonContextProvider>
          </QuickSearchContextProvider>
        </MainContentContextProvider>
      </ScrollStateContextProvider>
    ));

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
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
