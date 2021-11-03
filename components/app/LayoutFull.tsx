import { useEffect, useState, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";

import { Header, Map, QuickSearch, MobileNav } from ".";
import { useIsBreakPoint } from "~/hooks";
import { AppProps } from "~/types";
import { LoadingBar } from ".";
import { useSettingsContext } from "~/provider";
import { debounce } from "lodash";

// TODO: SEO Tags, inclusive featured image/cards ...

export const LayoutFull = ({ children }: AppProps) => {
  const router = useRouter();
  const settings = useSettingsContext();

  const { isMobile, isTablet } = useIsBreakPoint();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const onResize = debounce(() => {
    document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01).toFixed(5) + "px");
  }, 350);
  console.log(isLoadingSettings, fontsLoaded);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        document.documentElement.style.setProperty(
          "--chakra-colors-blur-blurredGray",
          "rgba(180,180,180,0.95)"
        );
      }

      if ("fonts" in document) {
        document.fonts.ready.then(() => {
          setFontsLoaded(true);
        });
      }

      
    }
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
    <>
      <Head>
        <link
          href="https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <LoadingBar color="cm.accentLight" loading={isLoadingSettings} />
      <Map />
      {!isLoadingSettings && fontsLoaded && <Header />}

      {!isLoadingSettings && fontsLoaded && children}

      {!isLoadingSettings && fontsLoaded && (isMobile || isTablet) && (
        <MobileNav />
      )}
      {!isLoadingSettings && fontsLoaded && <QuickSearch />}
    </>
  );
};
export default LayoutFull;
