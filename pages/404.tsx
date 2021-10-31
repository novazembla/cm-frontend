import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

import { Box, Heading, Text } from "@chakra-ui/react";
import { Footer, MainContent } from "~/components/app";
import { useAppTranslations } from "~/hooks";

export default function Page404() {
  const { t } = useAppTranslations();

  return (
    <MainContent>
      <Box layerStyle="page" w="100%">
        <Box layerStyle="headingPullOut" mb="3">
          <Heading as="h1" className="highlight" color="cm.text">
            {t("error.pagenotfound", "Page not found")}
          </Heading>
        </Box>
        <Text h="400px">
          {t("error.pleaseReloadInAFewMoments", "Please try again")}
        </Text>
      </Box>
      <Footer />
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
