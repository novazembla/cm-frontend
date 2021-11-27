import { ReactElement } from "react";

import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import { Grid, Box, Heading, Text } from "@chakra-ui/react";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useMapContext } from "~/provider";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

export function Page404() {
  const { t } = useAppTranslations();
  const cultureMap = useMapContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [cultureMap]);

  return (
    <MainContent isDrawer>
      <NextHeadSeo
        title={`${t("error.pagenotfound", "Page not found")} - ${getSeoAppTitle(
          t
        )}`}
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
          <Box layerStyle="page">
            <PageTitle
              h1
              type="high"
              title={t("error.pagenotfound", "Page not found")}
            />
            <Text h="400px">
              {t("error.pleaseReloadInAFewMoments", "Please try again")}
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

Page404.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Page404;
