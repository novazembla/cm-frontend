import { useEffect, useState, useRef, useCallback } from "react";

import { GetStaticProps } from "next";
import NextLink from "next/link";
import { getApolloClient } from "~/services";
import { motion, AnimatePresence } from "framer-motion";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Box,
  Flex,
  IconButton,
  Link,
  chakra,
  Collapse,
  Grid,
} from "@chakra-ui/react";
import { gql } from "@apollo/client";

import {
  MultiLangHtml,
  CardTour,
  CardLocation,
  CardEvent,
  SVG,
} from "~/components/ui";

import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { getLocationColors } from "~/utils";

import { Footer, MainContent } from "~/components/app";
import {
  useSettingsContext,
  useMapContext,
  useConfigContext,
} from "~/provider";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const settings = useSettingsContext();
  const config = useConfigContext();
  const cultureMap = useMapContext();

  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const [isMSOpen, setIsMSOpen] = useState(true);

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  const onResize = useCallback(() => {
    const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
  }, []);

  useEffect(() => {
    setIsMSOpen(true);

    console.log("bound index");
    if (typeof window === "undefined") return;
    window.addEventListener("resize", onResize);
    onResize();
    document.addEventListener("DOMContentLoaded", onResize);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
      console.log("unmounted index");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (homepage?.highlights?.length > 0 && settings && cultureMap) {
      console.log(homepage?.highlights);

      const highlights = homepage?.highlights.reduce(
        (hAcc: any, highlight: any) => {
          if (highlight.type === "location") {
            hAcc.push({
              id: highlight.id,
              lng: highlight?.lng,
              lat: highlight?.lat,
              title: highlight?.title,
              slug: highlight?.slug,
              color: getLocationColors(highlight, settings).color,
            });
          }

          if (highlight.type === "event" && highlight?.location) {
            hAcc.push({
              id: highlight?.location.id,
              lng: highlight?.location?.lng,
              lat: highlight?.location?.lat,
              title: highlight?.location?.title,
              slug: highlight?.location?.slug,
              color: getLocationColors(highlight?.location, settings).color,
            });
          }

          if (
            highlight.type === "tour" &&
            highlight?.tourStops?.length &&
            highlight?.tourStops[0]?.location
          ) {
            hAcc.push({
              id: highlight?.tourStops[0]?.location.id,
              lng: highlight?.tourStops[0]?.location?.lng,
              lat: highlight?.tourStops[0]?.location?.lat,
              title: highlight?.tourStops[0]?.location?.title,
              slug: highlight?.tourStops[0]?.location?.slug,
              color: getLocationColors(
                highlight?.tourStops[0]?.location,
                settings
              ).color,
            });
          }

          return hAcc;
        },
        []
      );
      if (highlights.length) {
        cultureMap.setHighlights(highlights);
        cultureMap.panTo(
          highlights[0].lng,
          highlights[1].lat,
          !window.matchMedia("(max-width: 44.999em)").matches
        );
      }
      console.log(highlights);
    }
    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [homepage?.highlights, settings, cultureMap, config]);

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
              zIndex="2"
            >
              <Box>
                <Box className={isMobile ? "clampThreeLines" : undefined}>
                  <b>
                    <MultiLangHtml json={homepage?.missionStatement} />
                  </b>
                </Box>
                <Flex
                  w="100%"
                  alignItems="center"
                  justifyContent={isMobile ? "space-between" : "flex-end"}
                  mt="1em"
                >
                  {homepage?.missionStatementPage?.slug && (
                    <NextLink
                      href={`/page/${getMultilangValue(
                        homepage?.missionStatementPage?.slug
                      )}/`}
                    >
                      <IconButton
                        as={Link}
                        variant="solid"
                        icon={
                          <SVG
                            type="arrow-right"
                            width={isMobile ? "30px" : "40px"}
                            height={isMobile ? "17px" : "22px"}
                          />
                        }
                        w={isMobile ? "30px" : "40px"}
                        h={isMobile ? "17px" : "22px"}
                        p="0"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        className="svgHover"
                        minW="0"
                        display="inline-block"
                        aria-label={t(
                          "mission.statement.read",
                          "read mission statement"
                        )}
                      />
                    </NextLink>
                  )}
                  {isMobile && (
                    <IconButton
                      icon={<SVG type="cross" width="200%" height="200%" />}
                      borderRadius="0"
                      p="0"
                      className="svgHover"
                      paddingInlineStart="0"
                      paddingInlineEnd="0"
                      padding="0"
                      bg="transparent"
                      w={isMobile ? "30px" : "40px"}
                      h={isMobile ? "30px" : "40px"}
                      minW="30px"
                      overflow="hidden"
                      transition="all 0.3s"
                      _hover={{
                        bg: "transparent",
                      }}
                      _active={{
                        bg: "transparent",
                      }}
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
            layerStyle="lightGray"
            overflow="hidden"
            sx={{
              article: {
                mb: !isMobile ? "20px" : "0",
                mr: !isMobile ? "0" : "20px",
              },
            }}
            w="100%"
          >
            <Grid
              w="100%"
              templateRows={{
                base: "1fr",
                md: "1fr auto",
              }}
              templateColumns="100%"
              minH={{
                md: "calc(100vh - 60px)",
                xl: "calc(100vh - 80px)",
              }}
            >
              {" "}
              <Box>
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
                  ref={highlightsRef}
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
                          <Box
                            key={`hb-${h.id}`}
                            {...mobileCardWrapper}
                            pr="20px"
                          >
                            <CardLocation
                              fillContainer={!isMobile}
                              key={`h-${h.id}`}
                              location={h}
                            />
                          </Box>
                        );
                      } else if (h.type === "event") {
                        return (
                          <Box
                            key={`hb-${h.id}`}
                            {...mobileCardWrapper}
                            pr="20px"
                          >
                            <CardEvent
                              fillContainer={!isMobile}
                              key={`h-${h.id}`}
                              event={h}
                            />
                          </Box>
                        );
                      } else if (h.type === "tour") {
                        return (
                          <Box
                            key={`hb-${h.id}`}
                            {...mobileCardWrapper}
                            pr="20px"
                          >
                            <CardTour
                              fillContainer={!isMobile}
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
              </Box>
              <Footer noBackground />
            </Grid>
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
