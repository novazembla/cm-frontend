import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

import { Box, Heading, Text } from "@chakra-ui/react";
import { Footer } from "~/components/app";
import { MainContent } from "~/components/ui";
import { useAppTranslations } from "~/hooks";

export default function Page500() {
  const { t } = useAppTranslations();
  
  return (
    <MainContent>
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
