import React from "react";
import { appWithTranslation } from "next-i18next";
import { ChakraProvider } from "@chakra-ui/react";

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
} from "~/provider";

import { chakraTheme } from "~/theme";

function MyApp({ Component, pageProps }: AppProps) {
  if (typeof window !== "undefined") console.log(chakraTheme);

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
      <AppApolloProvider>
        <ChakraProvider theme={chakraTheme}>
          <SettingsContextProvider>
            <ScrollStateContextProvider>
              <MapContextProvider>
                <QuickSearchContextProvider>
                  <MenuButtonContextProvider>
                    <LayoutFull>
                      <Component {...pageProps} />
                    </LayoutFull>
                  </MenuButtonContextProvider>
                </QuickSearchContextProvider>
              </MapContextProvider>
            </ScrollStateContextProvider>
          </SettingsContextProvider>
        </ChakraProvider>
      </AppApolloProvider>
    </ConfigContextProvider>
  );
}
export default appWithTranslation(MyApp);
