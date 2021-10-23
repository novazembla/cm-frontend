import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Box, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import {Footer} from "~/components/app";

export default function Page404() {
  const { t } = useTranslation();

  return (
    <>
    <Box layerStyle="page" w="100%">
      <Box layerStyle="headingPullOut" mb="3">
        <Heading as="h1" className="highlight" color="cm.text">
          {t("error.internalServerError", "Oops, an error happened on our server")}
        </Heading>
      </Box>
      <Text h="400px">{t("error.pleasetryagain", "Please try again")}</Text>
    </Box>
    <Footer />
    </>
  );
}

export const getStaticProps = async ({ locale }: { locale: any }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
