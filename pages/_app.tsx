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
  MainContentContextProvider,
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
            <MapContextProvider>
              <ScrollStateContextProvider>
                <MainContentContextProvider>
                  <QuickSearchContextProvider>
                    <MenuButtonContextProvider>
                      <LayoutFull>
                        <Component {...pageProps} />
                      </LayoutFull>
                    </MenuButtonContextProvider>
                  </QuickSearchContextProvider>
                </MainContentContextProvider>
              </ScrollStateContextProvider>
            </MapContextProvider>
          </SettingsContextProvider>
        </ChakraProvider>
      </AppApolloProvider>
    </ConfigContextProvider>
  );
}
export default appWithTranslation(MyApp);
