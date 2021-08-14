import React, { useContext } from "react";
import Head from "next/head";
import { Box, Grid } from "@chakra-ui/react";

import { Footer, Header, Sidebar, Map, QuickSearchResult } from ".";

import { AppProps } from "~/types";
import { useQuickSearchHasResultContext } from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  const hasQuickSearchResults = useQuickSearchHasResultContext();

  const columns = hasQuickSearchResults
    ? "100%"
    : { base: "100%", tw: "calc(260px + 1em) calc(100% - 260px - 3em)" };
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
        pt={{ base: "48px", tw: "68px" }}
        className="content"
      >
        <Header />

        {hasQuickSearchResults && <QuickSearchResult />}
        {!hasQuickSearchResults && (
          <>
            <Sidebar />

            <Box py={{ base: 3, tw: 4 }} w="100%">
              <Box mb={{ base: 2, tw: 3 }}>{children}</Box>

              <Footer />
            </Box>
          </>
        )}
      </Grid>
    </>
  );
};
export default LayoutFull;
