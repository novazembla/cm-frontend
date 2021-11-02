import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

import { Grid, Box, Heading, Text } from "@chakra-ui/react";
import { Footer, MainContent } from "~/components/app";
import { useAppTranslations } from "~/hooks";

export default function Page500() {
  const { t } = useAppTranslations();

  return (
    <MainContent isDrawer layerStyle="pageBg">
      <Grid w="100%" templateRows="1fr auto" templateColumns="100%" minH="100%">
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
