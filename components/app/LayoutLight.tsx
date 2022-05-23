import { useEffect, useState } from "react";

import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Map } from "./Map";
import { Logo } from "./Logo";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { AppProps } from "~/types";
import { LoadingBarLight } from "./LoadingBarLight";
import { useConfigContext, useSettingsContext } from "~/provider";
import debounce from "lodash/debounce";
import NextHeadSeo from "next-head-seo";

export const LayoutLight = ({ children }: AppProps) => {
  const settings = useSettingsContext();
  const config = useConfigContext();

  const { t } = useAppTranslations();
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

  let mapJsonBaseUrl;

  if (config.mapStyleJsonUrl && config.mapStyleJsonUrl.trim()) {
    try {
      const url = new URL(config.mapStyleJsonUrl);
      mapJsonBaseUrl = `${url.protocol}//${url.host}`;
    } catch (err) {}
  }

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/BerlinType/BerlinTypeWeb-Regular.woff2"
          as="font"
          type="font/woff2"
        />
        <link
          rel="preload"
          href="/fonts/BerlinType/BerlinTypeWeb-Bold.woff2"
          as="font"
          type="font/woff2"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <link rel="preconnect" href={config.apiUrl} />
        {mapJsonBaseUrl && <link rel="preconnect" href={mapJsonBaseUrl} />}
      </Head>
      <NextHeadSeo
        title={`${t("logo.culturemap1", "CULTURE MAP")} ${t(
          "logo.culturemap2",
          "Lichtenberg"
        )}`}
        maxDescriptionCharacters={300}
        og={{
          image: `${config.baseUrl}/img/social-media.png`,
          type: "article",
          siteName: `${t("logo.culturemap1", "CULTURE MAP")} ${t(
            "logo.culturemap2",
            "Lichtenberg"
          )}`,
        }}
        twitter={{
          card: "summary",
        }}
      />
      <LoadingBarLight color="cm.accentLight" />
      <Map layout="light" />
      <Box position="fixed" top="10px" left="10px" zIndex="20">
        {fontsLoaded && <Logo layout="light" />}
      </Box>
      {fontsLoaded && children}
    </>
  );
};
export default LayoutLight;
