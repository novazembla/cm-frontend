import { GetStaticProps } from "next";
import NextLink from "next/link";
import { getApolloClient } from "~/services";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Box, Flex, IconButton, Link, chakra, Collapse } from "@chakra-ui/react";
import { gql } from "@apollo/client";

import Arrow from "~/assets/svg/Pfeil_quer.svg";
import Cross from "~/assets/svg/Kreuz.svg";

import {
  MultiLangHtml,
  CardTour,
  CardLocation,
  CardEvent,
  MainContent,
} from "~/components/ui";

import { useAppTranslations, useIsBreakPoint } from "~/hooks";

import { Footer } from "~/components/app";

const homepageQuery = gql`
  query {
    homepage {
      missionStatement
      missionStatementPage
      highlights
    }
  }
`;

export const Home = ({ homepage }: { homepage: any }) => {
  const { t, getMultilangValue } = useAppTranslations();

  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const [isMSOpen, setIsMSOpen] = useState(true);

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  useEffect(() => {
    setIsMSOpen(true);
  }, []);

  if (!homepage) return <></>;

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      <Box>
        {homepage?.missionStatement && (
          <Collapse in={isMSOpen}>
            <Box
              layerStyle="pageContainerWhite"
              borderBottom="1px solid"
              borderColor="cm.accentDark"
              position={isMobile ? "fixed" : "static"}
              top="60px"
            >
              <Box>
                <b>
                  <MultiLangHtml json={homepage?.missionStatement} />
                </b>

                <Flex
                  w="100%"
                  alignItems="center"
                  justifyContent={isMobile ? "space-between" : "flex-end"}
                >
                  {homepage?.missionStatementPage?.slug && (
                    <NextLink
                      href={`/page/${getMultilangValue(
                        homepage?.missionStatementPage?.slug
                      )}/`}
                    > 
                      <IconButton
                        as={Link}
                        variant="outline"
                        icon={<Arrow />}
                        aria-label={t("mission.statement.read", "read mission statement")}
                      />
                    </NextLink>
                  )}
                  {isMobile && (
                    <IconButton
                      variant="outline"
                      icon={<Cross />}
                      aria-label={t("mission.statement.close", "close")}
                      onClick={() => setIsMSOpen(!isMSOpen)}
                    />
                  )}
                </Flex>
              </Box>
            </Box>
          </Collapse>
        )}
        {homepage?.highlights?.length > 0 && (
          <Box
            layerStyle="blurredLightGray"
            overflow="hidden"
            sx={{
              article: {
                mb: !isMobile ? "20px" : "0",
                mr: !isMobile ? "0" : "20px",
              },
            }}
            w="100%"
          >
            <chakra.h3
              className="highlight"
              color="cm.text"
              mt="0.5em"
              px="20px"
              textTransform="uppercase"
              textAlign={isMobile ? "center" : undefined}
              fontWeight="bold"
            >
              {t("homepage.title.highlights", "Highlights")}
            </chakra.h3>

            <Box
              overflowY={isMobile ? "auto" : "hidden"}
              w="100%"
              pl="20px"
              pb="20px"
              mb={isMobile ? "40px" : "0px"}
            >
              <Flex
                flexDirection={isMobile ? "row" : "column"}
                // w={isMobile ? "2000px" : "100%"}
                sx={{
                  "@media (max-width: 44.9999em)": {
                    flexDirection: "row",
                    //   w: "2000px",
                  },
                  "@media (min-width: 45em)": {
                    flexDirection: "column",
                    // w: "auto",
                    overflowY: "hidden",
                  },
                }}
              >
                {homepage?.highlights.map((h: any) => {
                  if (h.type === "location") {
                    return (
                      <Box key={`hb-${h.id}`} {...mobileCardWrapper} pr="20px">
                        <CardLocation
                          fillContainer={isMobile}
                          key={`h-${h.id}`}
                          location={h}
                        />
                      </Box>
                    );
                  } else if (h.type === "event") {
                    return (
                      <Box key={`hb-${h.id}`} {...mobileCardWrapper} pr="20px">
                        <CardEvent
                          fillContainer={isMobile}
                          key={`h-${h.id}`}
                          event={h}
                        />
                      </Box>
                    );
                  } else if (h.type === "tour") {
                    return (
                      <Box key={`hb-${h.id}`} {...mobileCardWrapper} pr="20px">
                        <CardTour
                          fillContainer={isMobile}
                          key={`h-${h.id}`}
                          tour={h}
                        />
                      </Box>
                    );
                  } else {
                    return <></>;
                  }
                })}
              </Flex>
            </Box>

            <Footer noBackground />
          </Box>
        )}
      </Box>
    </MainContent>
  );
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: homepageQuery,
    ...(context?.preview && accessToken
      ? {
          context: {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {}),
  });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      homepage: data?.homepage,
    },
    revalidate: 300,
  };
};

export default Home;
