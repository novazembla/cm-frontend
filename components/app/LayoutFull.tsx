import React, { useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, Grid } from "@chakra-ui/react";

import { Header, Map, QuickSearchResult, MobileNav } from ".";
import { useIsBreakPoint } from "~/hooks";
import { AppProps } from "~/types";
import { useQuickSearchHasResultContext } from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  const hasQuickSearchResults = useQuickSearchHasResultContext();
  const router = useRouter();
  const {isMobile} = useIsBreakPoint();

  const hideSidebar = ["/location/[slug]", "/event/[slug]", "/events"].includes(
    router.pathname
  );

  const columns = hasQuickSearchResults
    ? "100%"
    : {
        base: "100%",
        md: hideSidebar
          ? "max(500px, 25vw)"
          : "calc(260px + 1em) calc(100% - 260px - 3em)",
      };
  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </Head>
      <Map />
      <Header />
      <Box
        className="content"
        pt={{
          base: "60px",
          sm: "60px",
          md: "60px",
          xl:  "100",
          xl2:  "80px",
        }}
        pb={isMobile ? "100px" : undefined}
        w={{
          base: "100%",
          lg: "50%",
          xl: "675px",
        }}

        left={{
          base: 0,
          xl: "50px",
        }}
      >
        {hasQuickSearchResults && <QuickSearchResult />}
        {!hasQuickSearchResults && <>{children}</>}
      </Box>
      {isMobile && <MobileNav />}
    </>
  );
};
export default LayoutFull;
