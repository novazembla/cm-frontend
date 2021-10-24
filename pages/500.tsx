import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { GetStaticProps } from "next";

import { Box, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { Footer } from "~/components/app";

export default function Page404() {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};
