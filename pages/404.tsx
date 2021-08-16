import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { Box, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";

export default function Page404() {
  const { t } = useTranslation();

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1">{t("error.pagenotfound", "Page not found")}</Heading>
      <Text h="400px">{t("error.pleasetryagain", "Please try again")}</Text>
    </Box>
  );
}

export const getStaticProps = async ({ locale }: { locale: any }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
