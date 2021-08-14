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
} from "~/provider";

import "@fontsource/raleway/400.css";
import "@fontsource/raleway/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";

import { chakraTheme } from "~/theme";

function MyApp({ Component, pageProps }: AppProps) {
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
      <AppApolloProvider>
        <ChakraProvider theme={chakraTheme}>
          <MapContextProvider>
            <QuickSearchContextProvider>
              <LayoutFull>
                <Component {...pageProps} />
              </LayoutFull>
            </QuickSearchContextProvider>
          </MapContextProvider>
        </ChakraProvider>
      </AppApolloProvider>
    </ConfigContextProvider>
  );
}
export default appWithTranslation(MyApp);
