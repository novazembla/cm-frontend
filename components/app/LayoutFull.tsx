import React from "react";
import Head from "next/head";
import { Box, Grid } from "@chakra-ui/react";

import { Footer, Header, Sidebar, Map } from ".";

import { AppProps } from "~/types";

export const LayoutFull = ({ children }: AppProps ) => {
  return (<>
    <Head>
      <link href='https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css' rel='stylesheet' />
    </Head>
    <Map />
    <Grid
      w="100%"
      // templateColumns={{ base: "1fr", tw: "260px 1fr" }}
      templateColumns={{ base: "100%", tw: "260px calc(100% - 260px - 1em)" }}
      gap="4"
      alignItems="start"
      pt={{ base: "48px", tw: "72px" }}
      className="content"
    >
      <Header />

      <Sidebar />

      <Box p={{ base: 3, tw: 4 }} w="100%">
        <Box mb={{ base: 2, tw: 3 }}>{children}</Box>

        <Footer />
      </Box>
    </Grid>
    </>
  );
};
export default LayoutFull;