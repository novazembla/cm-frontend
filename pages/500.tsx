import { ReactElement } from "react";

import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";
import LayoutFull from "~/components/app/LayoutFull";

import { Grid, Box, Heading, Text } from "@chakra-ui/react";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { useAppTranslations } from "~/hooks";
import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useMapContext } from "~/provider";

export function Page500() {
  const { t } = useAppTranslations();
  const cultureMap = useMapContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [cultureMap]);

  return (
    <MainContent isDrawer layerStyle="pageBg">
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
        <Box layerStyle="page" w="100%">
          <Box layerStyle="headingPullOut" mb="3">
            <Heading as="h1" className="highlight" color="cm.text">
              {t(
                "error.internalServerError",
                "Oops, an error happened on our server"
              )}
            </Heading>
          </Box>
          <Text h="400px">{t("error.pleasetryagain", "Please try again")}</Text>
        </Box>
        <Footer />
      </Grid>
    </MainContent>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};

Page500.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Page500;