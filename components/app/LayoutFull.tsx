import { useEffect, useState, useRef } from "react";

import Head from "next/head";

import { Header } from "./Header";
import { Map } from "./Map";
import { QuickSearch } from "./QuickSearch";
import { MobileNav } from "./MobileNav";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { AppProps } from "~/types";
import { LoadingBar } from "./LoadingBar";
import { useSettingsContext } from "~/provider";
import debounce from "lodash/debounce";
import NextHeadSeo from "next-head-seo";

import { chakra } from "@chakra-ui/react";

import { UserTracking } from "./UserTracking";
import {
  QuickSearchContextProvider,
  MenuButtonContextProvider,
  ScrollStateContextProvider,
  MainContentContextProvider,
} from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  const settings = useSettingsContext();
  const { t } = useAppTranslations();
  const { isMobile, isTablet } = useIsBreakPoint();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const onResize = debounce(() => {
    document.documentElement.style.setProperty(
      "--vh",
      (window.innerHeight * 0.01).toFixed(5) + "px"
    );
  }, 350);

  useEffect(() => {
    let mounted = true;
    if (typeof window !== "undefined") {
      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        document.documentElement.style.setProperty(
          "--chakra-colors-blur-blurredGray",
          "rgba(180,180,180,0.95)"
        );
        document.documentElement.style.setProperty(
          "--chakra-colors-blur-blurredWhite",
          "rgba(255,255,255,0.95)"
        );
      }

      if ("fonts" in document) {
        document.fonts.ready.then(() => {
          if (mounted) setFontsLoaded(true);
        });
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", onResize);
    onResize();

    const div = document.createElement("div");
    div.style.height = "100vh";
    div.style.width = "1px";
    div.style.position = "absolute";
    div.style.top = "0px";
    div.style.left = "-1px";

    document.body.appendChild(div);

    document.documentElement.style.setProperty(
      "--locationBarHeight",
      `${div.offsetHeight - window.innerHeight}px`
    );
    div.remove();

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings?.terms) setIsLoadingSettings(false);
  }, [settings]);

  return (
    <ScrollStateContextProvider>
      <MainContentContextProvider>
        <QuickSearchContextProvider>
          <MenuButtonContextProvider>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <meta name="theme-color" content="#fff" />
            </Head>
            <UserTracking />
            <NextHeadSeo
              title={`${t("logo.culturemap1", "CULTUREMAP")} ${t(
                "logo.culturemap2",
                "Lichtenberg"
              )}`}
              og={{
                image: "https://example.com/default-og.png", // TOOD: default image
                type: "article",
                siteName: `${t("logo.culturemap1", "CULTUREMAP")} ${t(
                  "logo.culturemap2",
                  "Lichtenberg"
                )}`,
              }}
              twitter={{
                card: "summary",
              }}
            />
            <chakra.a href="#content" className="skipToContent">
              {t("header.skipToContent", "Skip to content")}
            </chakra.a>
            <LoadingBar color="cm.accentLight" loading={isLoadingSettings} />
            {!isLoadingSettings && fontsLoaded && (isMobile || isTablet) && (
              <MobileNav />
            )}
            {!isLoadingSettings && fontsLoaded && <Header />}

            <Map layout="full" />

            {!isLoadingSettings && fontsLoaded && children}

            {!isLoadingSettings && fontsLoaded && <QuickSearch />}
          </MenuButtonContextProvider>
        </QuickSearchContextProvider>
      </MainContentContextProvider>
    </ScrollStateContextProvider>
  );
};
export default LayoutFull;
