import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { ReactElement } from 'react'
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Box, Heading } from "@chakra-ui/react";


export default function Home() {
  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3">
        XXX 
      </Heading>
      <Box maxW="800px">dklajsklflksdafkljdfskljflkdsajklj</Box>
    </Box>
  );
}


export const getStaticProps = async ({ locale }: {locale: any}) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});
