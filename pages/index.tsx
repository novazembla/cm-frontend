import { useEffect, useState, useRef, UIEvent } from "react";

import { GetStaticProps } from "next";
import NextLink from "next/link";
import { getApolloClient } from "~/services";
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
import { debounce } from "lodash";
import NextHeadSeo from "next-head-seo";

const homepageQuery = gql`
  query {
    homepage {
      missionStatement
      missionStatementPage
      highlights
    }
  }
`;

const MOBILE_CARD_WIDTH = 275;

export const Home = ({ homepage }: { homepage: any }) => {
  const { t, getMultilangValue } = useAppTranslations();
  const settings = useSettingsContext();
  const config = useConfigContext();
  const cultureMap = useMapContext();

  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const isMobileRef = useRef<boolean>(false);
  const containersRef = useRef<any>(null);
  const parsedHighlightsRef = useRef<any>(null);
  const currentHightlightIndexRef = useRef<number>(0);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const highlightsCardsContainerRef = useRef<HTMLDivElement>(null);

  const [highlights, setHighlights] = useState<any[]>([]);
  const [currentHightlightIndex, setCurrentHightlightIndex] = useState(0);

  const [isMSOpen, setIsMSOpen] = useState(true);

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  const onResize = debounce(() => {
    if (
      !highlightsRef.current ||
      !highlightsCardsContainerRef.current ||
      !containersRef.current
    )
      return;

    const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 74.999em)"
    ).matches;

    if (isMobile) {
      if (containersRef.current?.length) {
        highlightsCardsContainerRef.current.style.width = `${
          containersRef.current?.length * (MOBILE_CARD_WIDTH + 20) +
          window.innerWidth -
          (MOBILE_CARD_WIDTH * 1.05 + 40)
        }px`;
      } else {
        highlightsCardsContainerRef.current.style.width = "";
      }
      highlightsCardsContainerRef.current.style.paddingBottom = "";
    } else {
      if (containersRef.current?.length) {
        highlightsCardsContainerRef.current.style.paddingBottom = "";
        const pB = Math.max(
          0,
          window.innerHeight -
            (isTablet ? 100 : 120) -
            (document.documentElement.scrollHeight -
              containersRef.current[containersRef.current.length - 1].offsetTop)
        );
        if (pB > 0) {
          highlightsCardsContainerRef.current.style.paddingBottom = `${pB}px`;
        } else {
          highlightsCardsContainerRef.current.style.paddingBottom = "";
        }
      } else {
        highlightsCardsContainerRef.current.style.paddingBottom = "";
      }

      highlightsCardsContainerRef.current.style.width = "";
    }
  }, 350);

  const onScroll = () => {
    if (
      isMobileRef.current ||
      !highlightsRef.current ||
      !highlightsCardsContainerRef.current ||
      !containersRef.current ||
      !cultureMap ||
      !parsedHighlightsRef.current
    )
      return;

    if (containersRef.current?.length) {
      let newIndex = [...containersRef.current].reduce(
        (acc: number, container: HTMLDivElement, index: number) => {
          if (
            container.offsetTop - 20 <= window.scrollY + 100 &&
            window.scrollY + 100 <
              container.offsetTop - 20 + container.offsetHeight
          )
            return index;

          return acc;
        },
        0
      );

      if (currentHightlightIndexRef.current !== newIndex) {
        if (parsedHighlightsRef.current?.[newIndex]) {
          currentHightlightIndexRef.current = newIndex;
          cultureMap.panTo(
            parsedHighlightsRef.current?.[newIndex].lng,
            parsedHighlightsRef.current?.[newIndex].lat,
            !isMobileRef.current,
            isMobileRef.current && !isMSOpen
          );
        }
      }
    }
  };

  useEffect(() => {
    setIsMSOpen(true);

    if (typeof window === "undefined" || !highlightsCardsContainerRef.current)
      return;

    isMobileRef.current = window.matchMedia("(max-width: 44.999em)").matches;
    containersRef.current =
      highlightsCardsContainerRef.current.querySelectorAll(".cardContainer");

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    onResize();
    onScroll();
    document.addEventListener("DOMContentLoaded", onResize);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (homepage?.highlights?.length > 0 && settings && cultureMap) {
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
      cultureMap.showCurrentView();

      if (highlights.length) {
        cultureMap.setHighlights(highlights);
        cultureMap.panTo(
          highlights[0].lng,
          highlights[0].lat,
          !window.matchMedia("(max-width: 44.999em)").matches
        );
        setHighlights(highlights);
        parsedHighlightsRef.current = highlights;
      }
    }
    return () => {
      if (cultureMap) {
        cultureMap.clearHighlights();
      }
    };
  }, [homepage?.highlights, settings, cultureMap, config, isMobile]);

  if (!homepage) return <></>;

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      <NextHeadSeo
        description={getMultilangValue(homepage?.missionStatement)}
      />
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
              <Box>
                <chakra.h1
                  className="highlight"
                  color="cm.text"
                  mt="0.5em"
                  px="20px"
                  textTransform="uppercase"
                  textAlign={isMobile ? "center" : undefined}
                  fontWeight="bold"
                >
                  {t("homepage.title.highlights", "Highlights")}
                </chakra.h1>

                <Box
                  overflowY={isMobile ? "auto" : "hidden"}
                  w="100%"
                  pl="20px"
                  pb="20px"
                  mb={isMobile ? "40px" : "0px"}
                  ref={highlightsRef}
                  onScroll={
                    isMobile
                      ? (e: UIEvent<HTMLDivElement>) => {
                          if (highlights?.length && cultureMap) {
                            const scrollLeft = (e.target as any).scrollLeft;
                            let newIndex = Math.floor(
                              (scrollLeft + (MOBILE_CARD_WIDTH + 20) * 0.25) /
                                (MOBILE_CARD_WIDTH + 20)
                            );

                            if (
                              currentHightlightIndex !== newIndex &&
                              parsedHighlightsRef.current?.[newIndex]
                            ) {
                              cultureMap.panTo(
                                parsedHighlightsRef.current[newIndex].lng,
                                parsedHighlightsRef.current[newIndex].lat,
                                !isMobile,
                                isMobile && !isMSOpen
                              );
                              setCurrentHightlightIndex(newIndex);
                            }
                          }
                        }
                      : undefined
                  }
                >
                  <Flex
                    flexDirection={isMobile ? "row" : "column"}
                    className="cardsContainer"
                    sx={{
                      "@media (max-width: 44.9999em)": {
                        flexDirection: "row",
                      },
                      "@media (min-width: 45em)": {
                        flexDirection: "column",
                        overflowY: "hidden",
                      },
                    }}
                    ref={highlightsCardsContainerRef}
                  >
                    {homepage?.highlights.map((h: any) => {
                      if (h.type === "location") {
                        return (
                          <Box
                            key={`hb-${h.id}`}
                            {...mobileCardWrapper}
                            pr="20px"
                            className="cardContainer"
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
                            className="cardContainer"
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
                            className="cardContainer"
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
