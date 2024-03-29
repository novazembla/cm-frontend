import { ReactElement } from "react";

import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";
import LayoutFull from "~/components/app/LayoutFull";

import { Grid, Box, Text } from "@chakra-ui/react";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useMapContext } from "~/provider";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

export function Page500() {
  const { t } = useAppTranslations();
  const cultureMap = useMapContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [cultureMap]);

  return (
    <MainContent isDrawer>
      <NextHeadSeo
        title={`${t(
          "error.internalServerError",
          "Oops, an error happened on our server"
        )} - ${getSeoAppTitle(t)}`}
      />
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box layerStyle="pageBg">
          <Box layerStyle="page" w="100%">
            <PageTitle
              h1
              type="high"
              title={t(
                "error.internalServerError",
                "Oops, an error happened on our server"
              )}
            />

            <Text h="400px">
              {t("error.pleasetryagain", "Please try again")}
            </Text>
          </Box>
        </Box>
        <Box>
          <Footer />
        </Box>
      </Grid>
    </MainContent>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;
  const client = getApolloClient();

  const { data } = await client.query({
    query: settingsQuery,
  });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 300,
  };
};

Page500.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Page500;
