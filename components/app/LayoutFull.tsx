import { useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";

import { Header, Map, QuickSearch, MobileNav } from ".";
import { useIsBreakPoint } from "~/hooks";
import { AppProps } from "~/types";
import { LoadingBar } from ".";
import {} from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  const router = useRouter();

  const { isMobile, isTablet } = useIsBreakPoint();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        document.documentElement.style.setProperty(
          "--chakra-colors-blur-gray",
          "rgba(180,180,180,0.95)"
        );
      }
    }
  }, []);

  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <LoadingBar color="cm.accentLight" />
      <Map />
      <Header />

      <AnimatePresence>
        <motion.div
          key={`ccc-${router.asPath}`}
          id={`p-${router.asPath.replace(/[^a-z]/g, "")}`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: !isMobile ? "fixed" : "absolute",
            zIndex: 3,
            height: "100vh",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {(isMobile || isTablet) && <MobileNav />}
      <QuickSearch />
    </>
  );
};
export default LayoutFull;
