import {
  useEffect,
  ReactElement,
  useState,
  useRef,
  UIEvent,
  useCallback,
} from "react";

import { GetStaticProps } from "next";
import NextLink from "next/link";
import { getApolloClient } from "~/services";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Box,
  Flex,
  IconButton,
  chakra,
  Collapse,
  Grid,
  Portal,
} from "@chakra-ui/react";
import { gql } from "@apollo/client";

import LayoutFull from "~/components/app/LayoutFull";

import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { CardTour } from "~/components/ui/CardTour";
import { CardLocation } from "~/components/ui/CardLocation";
import { CardEvent } from "~/components/ui/CardEvent";
import { SVG } from "~/components/ui/SVG";

import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { getLocationColors, getMetaDescriptionContent } from "~/utils";

import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import {
  useSettingsContext,
  useMapContext,
  useConfigContext,
} from "~/provider";
import debounce from "lodash/debounce";
import NextHeadSeo from "next-head-seo";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQueryPartial } from "~/graphql";

const homepageQuery = gql`
  query {
    homepage {
      missionStatement
      missionStatementPage
      metaDesc
      highlights
    }
    ${settingsQueryPartial}
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
  const footerRef = useRef<HTMLDivElement>(null);
  const highlightsCardsContainerRef = useRef<HTMLDivElement>(null);

  const [highlights, setHighlights] = useState<any[]>([]);
  const [currentHightlightIndex, setCurrentHightlightIndex] = useState(0);

  const [isMSOpen, setIsMSOpen] = useState(true);

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  const onResize = useCallback(() => {
    if (
      !highlightsCardsContainerRef.current ||
      !containersRef.current ||
      !footerRef?.current
    )
      return;

    const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 74.999em)"
    ).matches;

    if (isMobile) {
      if (containersRef.current?.length) {
        containersRef.current[
          containersRef.current?.length - 1
        ].style.marginRight = "";

        containersRef.current[
          containersRef.current?.length - 1
        ].style.marginRight = `${
          window.innerWidth -
          containersRef.current[containersRef.current?.length - 1].offsetWidth -
          20
        }px`;
      }
      highlightsCardsContainerRef.current.style.paddingBottom = "";
    } else {
      if (containersRef.current?.length) {
        highlightsCardsContainerRef.current.style.paddingBottom = "";
        containersRef.current[
          containersRef.current?.length - 1
        ].style.marginRight = "";
        const pB = Math.max(
          0,
          5 +
            window.innerHeight -
            (isTablet ? 120 : 140) -
            containersRef.current[containersRef.current.length - 1]
              .offsetHeight -
            footerRef.current.offsetHeight
        );
        if (pB > 0) {
          highlightsCardsContainerRef.current.style.paddingBottom = `${pB}px`;
        } else {
          highlightsCardsContainerRef.current.style.paddingBottom = "";
        }
      } else {
        highlightsCardsContainerRef.current.style.paddingBottom = "";
      }
    }
  }, []);
  const onResizeDebounced = debounce(onResize, 350);

  const onScroll = () => {
    if (
      isMobileRef.current ||
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

    window.addEventListener("resize", onResizeDebounced);
    window.addEventListener("scroll", onScroll);
    onResize();
    onScroll();
    document.addEventListener("DOMContentLoaded", onResize);
    setTimeout(onResize, 350);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResizeDebounced);
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
        cultureMap.setInitallyFitToBounds(false);
        cultureMap.setHighlights(highlights);
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

  const missionStatement = homepage?.missionStatement && (
    <Collapse in={isMSOpen}>
      <Box
        layerStyle="white"
        borderBottom="1px solid"
        borderColor="cm.accentDark"
        position={isMobile ? "fixed" : "static"}
        top="60px"
        zIndex="2"
        p={{ base: "20px", md: "40px", "2xl": "50px" }}
        transform="translate3d(0,0,0)"
      >
        <Box px={!isMobile ? "10px" : 0}>
          <Box
            textStyle={!isMobile ? "larger" : undefined}
            className={isMobile ? "clampThreeLines" : undefined}
          >
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
                passHref
              >
                <chakra.a
                  w={isMobile ? "30px" : "40px"}
                  h={isMobile ? "17px" : "22px"}
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  className="svgHover"
                  minW="0"
                  display="inline-block"
                  title={t("mission.statement.read", "read mission statement")}
                >
                  <SVG
                    type="arrow-right"
                    width={isMobile ? "30px" : "40px"}
                    height={isMobile ? "17px" : "22px"}
                  />
                </chakra.a>
              </NextLink>
            )}
            {isMobile && (
              <IconButton
                icon={<SVG type="cross" width="200%" height="200%" />}
                w={isMobile ? "30px" : "40px"}
                h={isMobile ? "30px" : "40px"}
                minW="30px"
                borderRadius="0"
                p="0"
                className="svgHover tabbedFocus"
                _focus={{
                  bg: "transparent",
                  boxShadow: "none",
                }}
                paddingInlineStart="0"
                paddingInlineEnd="0"
                padding="0"
                bg="transparent"
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
  );
  
  return (
    <MainContent 
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      <NextHeadSeo
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(homepage?.metaDesc),
          getMultilangValue(homepage?.missionStatement)
        )}
      />
      <Box>
        {missionStatement &&
          (isMobile ? <Portal>{missionStatement}</Portal> : missionStatement)}
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
                <Box px="20px" pt="0.5em">
                  <PageTitle
                    h1
                    title={t("homepage.title.highlights", "Highlights")}
                    type="short"
                    center={isMobile}
                  />
                </Box>
                <Box
                  w="100%"
                  pl={isMobile ? "0px" : "20px"}
                  pb="20px"
                  mb={isMobile ? "40px" : "0px"}
                >
                  <Flex
                    className="cardsContainer"
                    flexDirection={{
                      base: "row",
                      md: "column",
                    }}
                    sx={{
                      scrollSnapType: "x mandatory",

                      scrollBehavior: "smooth",
                    }}
                    w="100%"
                    tabIndex={isMobile ? 0 : undefined}
                    role="group"
                    aria-labelledby="title"
                    overflowY={isMobile ? "auto" : "hidden"}
                    ref={highlightsCardsContainerRef}
                    pb={isMobile ? "20px" : undefined}
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
                    {homepage?.highlights.map((h: any) => {
                      if (h.type === "location") {
                        return (
                          <Box
                            key={`hb-${h.id}`}
                            {...mobileCardWrapper}
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
              <Box ref={footerRef}>
                <Footer noBackground />
              </Box>
            </Grid>
          </Box>
        )}
      </Box>
    </MainContent>
  );
};

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
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 300,
  };
};
Home.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Home;
