import React, { useContext } from "react";
import Head from "next/head";
import { useRouter } from 'next/router'
import { Box, Grid } from "@chakra-ui/react";

import { Footer, Header, Sidebar, Map, QuickSearchResult } from ".";
import { useSSRSaveMediaQuery} from "~/hooks";
import { AppProps } from "~/types";
import { useQuickSearchHasResultContext } from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  const hasQuickSearchResults = useQuickSearchHasResultContext();
  const router = useRouter();
  const isMobile = useSSRSaveMediaQuery("(max-width: 55em)");
  console.log("Rrrrrouter" , router);
  const hideSidebar = ["/location/[slug]", "/event/[slug]", "/events"].includes(router.pathname);

  const columns = hasQuickSearchResults
    ? "100%"
    : { base: "100%", tw: hideSidebar ? "max(500px, 25vw) 1fr" : "calc(260px + 1em) calc(100% - 260px - 3em)" };
  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </Head>
      <Map />
      <Grid
        w="100%"
        // templateColumns={{ base: "1fr", tw: "260px 1fr" }}
        templateColumns={columns}
        gap="4"
        alignItems="start"
        pt={{ base: "60px", tw: "68px" }}
        className="content"
      >
        <Header />

        {hasQuickSearchResults && <QuickSearchResult />}
        {!hasQuickSearchResults && (
          <>
            {(isMobile || !isMobile && !hideSidebar) && <Sidebar />}

            <Box py={{ base: 3, tw: 4 }} px={{base:"4", tw: hideSidebar? "4": "0"}}w="100%">
              <Box mb={{ base: 2, tw: 3 }}>{children}</Box>

              
            </Box>
          </>
        )}
      </Grid>
      <Footer />
    </>
  );
};
export default LayoutFull;
