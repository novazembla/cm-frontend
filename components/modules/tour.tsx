import { useEffect, useState, useRef, UIEvent, useCallback } from "react";
import { gql } from "@apollo/client";
import {
  MultiLangValue,
  TrimmedTextWithBottomEdge,
  ApiImage,
  CardTourStop,
  SVG,
} from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import {
  useMapContext,
  useConfigContext,
  useSettingsContext,
  useScrollStateContext,
} from "~/provider";
import {
  Box,
  Flex,
  AspectRatio,
  LinkBox,
  Text,
  LinkOverlay,
  chakra,
  Grid,
} from "@chakra-ui/react";
import { htmlToTrimmedString, getSeoAppTitle, getSeoImage } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { getLocationColors } from "~/utils";
import NextLink from "next/link";

const MOBILE_CARD_WIDTH = 275;

export const tourQuery = gql`
  query ($slug: String!) {
    tour(slug: $slug) {
      id
      title
      slug
      distance
      duration
      teaser
      description
      orderNumber
      ownerId
      path
      heroImage {
        id
        meta
        status
        alt
        credits
        cropPosition
      }
      tourStopCount
      tourStops {
        id
        title
        number
        teaser
        description
        images {
          id
          status
          meta
          alt
          credits
        }
        heroImage {
          id
          status
          meta
          alt
          credits
          cropPosition
        }
        location {
          id
          title
          slug
          description
          lat
          lng
          primaryTerms {
            id
            name
          }
          terms {
            id
            name
          }
        }
      }
    }
  }
`;

export const createTourStops = (
  stops: any,
  tourSlug: string,
  newIndex: number,
  settings: any
) => {
  return stops
    ?.map((ts: any, index: number) => ({
      number: ts?.number,
      id: ts?.location.id,
      lng: ts?.location?.lng,
      lat: ts?.location?.lat,
      title: ts?.title,
      slug: `/tour/${tourSlug}/${ts?.number}`,
      color: getLocationColors(ts?.location, settings).color,
      highlight: index === newIndex,
    }))
    .sort((a: any, b: any) => {
      if (a?.number < b?.number) return -1;
      if (a?.number > b?.number) return 1;
      return 0;
    });
};

export const ModuleComponentTour = ({ tour }: { tour: any }) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const [fillContainer, setFillContainer] = useState(true);

  const isMobileRef = useRef<boolean>(false);
  const containersRef = useRef<any>(null);
  const parsedTourStopsRef = useRef<any>(null);
  const currentHightlightIndexRef = useRef<number>(-2);
  const tourStopsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const tourStopsCardsContainerRef = useRef<HTMLDivElement>(null);

  const scrollState = useScrollStateContext();

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  const onResize = useCallback(() => {
    if (
      !tourStopsRef.current ||
      !tourStopsCardsContainerRef.current ||
      !containersRef.current ||
      !footerRef.current
    )
      return;

    const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
    const isTablet = window.matchMedia(
      "(min-width: 45em) and (max-width: 74.999em)"
    ).matches;

    if (isMobile) {
      if (containersRef.current?.length) {
        tourStopsCardsContainerRef.current.style.width = `${
          containersRef.current?.length * (MOBILE_CARD_WIDTH + 20) +
          window.innerWidth -
          (MOBILE_CARD_WIDTH * 1.05 + 40)
        }px`;
      } else {
        tourStopsCardsContainerRef.current.style.width = "";
      }
      tourStopsCardsContainerRef.current.style.paddingBottom = "";
    } else {
      if (containersRef.current?.length) {
        tourStopsCardsContainerRef.current.style.paddingBottom = "";
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
          tourStopsCardsContainerRef.current.style.paddingBottom = `${pB}px`;
        } else {
          tourStopsCardsContainerRef.current.style.paddingBottom = "";
        }
      } else {
        tourStopsCardsContainerRef.current.style.paddingBottom = "";
      }

      tourStopsCardsContainerRef.current.style.width = "";
    }
  }, []);

  const onScroll = () => {
    if (
      isMobileRef.current ||
      !tourStopsRef.current ||
      !tourStopsCardsContainerRef.current ||
      !containersRef.current ||
      !cultureMap ||
      !parsedTourStopsRef.current
    )
      return;

    if (containersRef.current?.length) {
      let newIndex = [...containersRef.current].reduce(
        (acc: number, container: HTMLDivElement, index: number) => {
          if (
            index > 1 &&
            container.offsetTop - 20 <= window.scrollY + 100 &&
            window.scrollY + 100 <
              container.offsetTop - 20 + container.offsetHeight
          ) {
            return index - 2;
          }

          return acc;
        },
        -1
      );

      if (currentHightlightIndexRef.current !== newIndex) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          newIndex,
          settings
        );

        cultureMap.setTourStops(stops);

        if (parsedTourStopsRef.current?.[Math.max(newIndex, 0)]) {
          cultureMap.panTo(
            parsedTourStopsRef.current?.[Math.max(newIndex, 0)].lng,
            parsedTourStopsRef.current?.[Math.max(newIndex, 0)].lat,
            !isMobileRef.current
          );
        }

        currentHightlightIndexRef.current = newIndex;
      }
    }
  };

  const onVerticalScroll = (scrollLeft: number) => {
    if (tour?.tourStops?.length && cultureMap) {
      scrollState.set(
        "vertical",
        router.asPath.replace(/[^a-z]/g, ""),
        scrollLeft
      );

      let newIndex = -1;
      if (scrollLeft - (MOBILE_CARD_WIDTH + 20) * 1.75 > 0) {
        newIndex = Math.floor(
          (scrollLeft -
            (MOBILE_CARD_WIDTH + 20) * 2.5 +
            (MOBILE_CARD_WIDTH + 20) * 0.75) /
            (MOBILE_CARD_WIDTH + 20)
        );
      }

      if (currentHightlightIndexRef.current !== newIndex) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          newIndex,
          settings
        );

        cultureMap.setTourStops(stops);
        if (parsedTourStopsRef.current?.[Math.max(newIndex, 0)]) {
          cultureMap.panTo(
            parsedTourStopsRef.current[Math.max(newIndex, 0)].lng,
            parsedTourStopsRef.current[Math.max(newIndex, 0)].lat,
            !isMobile,
            isMobile
          );
        }
        currentHightlightIndexRef.current = newIndex;
      }
    }
  };

  useEffect(() => {
    if (cultureMap) cultureMap.hideCurrentView();
    currentHightlightIndexRef.current = -2;

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions
    // TODO: this is on mount call back
    // setTourStop(null)
    return () => {
      if (cultureMap) cultureMap.clearTour();
    };
  }, [router.asPath, cultureMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tour?.tourStops?.length > 0 && settings && cultureMap) {
      if (tour?.path) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          -1,
          settings
        );

        cultureMap.setTourPath(tour?.path);

        if (
          !scrollState.wasBack() ||
          (!isMobileRef.current &&
            typeof window !== "undefined" &&
            window.scrollY === 0)
        ) {
          cultureMap.setTourStops(stops);

          if (!scrollState.wasBack()) {
            cultureMap.fitToCurrentTourBounds();
          }
        }

        if (
          !scrollState.wasBack() ||
          isMobileRef.current ||
          (!isMobileRef.current &&
            typeof window !== "undefined" &&
            window.scrollY === 0)
        ) {
          cultureMap.panTo(
            stops[0].lng,
            stops[0].lat,
            !isMobileRef.current,
            isMobileRef.current
          );
        }

        parsedTourStopsRef.current = stops;
      }
    }
    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [
    router.asPath,
    scrollState,
    scrollState.wasBack,
    tour?.tourStops,
    tour?.path,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !tourStopsCardsContainerRef.current)
      return;

    isMobileRef.current = window.matchMedia("(max-width: 44.999em)").matches;

    containersRef.current =
      tourStopsCardsContainerRef.current.querySelectorAll(".cardContainer");

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);
    onResize();
    if (isMobileRef.current) {
      const scrollLeft = scrollState.get(
        "vertical",
        router.asPath.replace(/[^a-z]/g, "")
      );
      if (scrollState.wasBack() && scrollLeft) {
        tourStopsRef.current?.scrollTo({
          left: scrollLeft,
          top: 0,
        });
      } else {
        onVerticalScroll(0);
      }
    }

    setTimeout(onResize, 100);

    onScroll();
    document.addEventListener("DOMContentLoaded", onResize);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let color = config.colorDark;

  const teaser = htmlToTrimmedString(getMultilangHtml(tour.teaser) ?? "", 200);

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      <NextHeadSeo
        canonical={`${
          i18n.language === "en" ? "/en" : ""
        }/tour/${getMultilangValue(tour?.slug)}`}
        title={`${getMultilangValue(tour?.title)} - ${getSeoAppTitle(t)}`}
        description={getMultilangValue(tour?.teaser)}
        og={{
          image: getSeoImage(tour?.heroImage),
        }}
      />
      {tour?.tourStops?.length > 0 && (
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
              <chakra.h3
                className="highlight"
                color="cm.text"
                mt="0.5em"
                px="20px"
                textTransform="uppercase"
                fontWeight="bold"
                w="100%"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
              >
                {isMobile
                  ? getMultilangValue(tour?.title)
                  : t("tour.title.tour", "Tour")}
              </chakra.h3>

              <Box
                overflowY={isMobile ? "auto" : "hidden"}
                w="100%"
                pl="20px"
                pb="20px"
                mb={isMobile ? "40px" : "0px"}
                ref={tourStopsRef}
                onScroll={
                  isMobile
                    ? (e: UIEvent<HTMLDivElement>) => {
                        const scrollLeft = (e.target as any).scrollLeft;
                        onVerticalScroll(scrollLeft);
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
                  ref={tourStopsCardsContainerRef}
                >
                  <Box
                    key={`ts-intro`}
                    {...mobileCardWrapper}
                    pr="20px"
                    className="cardContainer"
                  >
                    <LinkBox
                      as="article"
                      data-id="introduction"
                      bg="#fff"
                      borderRadius="lg"
                      overflow="hidden"
                      w="100%"
                      maxW={isMobile && !fillContainer ? "275px" : "100%"}
                      h={isMobile && fillContainer ? "100%" : undefined}
                      className="svgHover"
                    >
                      {
                        <Flex
                          flexDirection="column"
                          alignItems={isMobile ? "flex-end" : "flex-start"}
                        >
                          <Box w={isMobile ? "50%" : "100%"} pb="0px">
                            <AspectRatio
                              w="100%"
                              ratio={isMobile ? 3 / 2 : 16 / 9}
                            >
                              <Box bg={color}>
                                {tour?.heroImage && tour?.heroImage?.id && (
                                  <Box
                                    w="100%"
                                    h="100%"
                                    sx={
                                      isMobile
                                        ? {
                                            mixBlendMode: "screen",

                                            "img, picture": {
                                              filter: " grayscale(1)",
                                            },
                                          }
                                        : {}
                                    }
                                  >
                                    <ApiImage
                                      id={tour?.heroImage?.id}
                                      alt={getMultilangValue(
                                        tour?.heroImage.alt
                                      )}
                                      meta={tour?.heroImage?.meta}
                                      forceAspectRatioPB={
                                        isMobile ? 66.66 : 56.25
                                      }
                                      status={tour?.heroImage?.status}
                                      sizes="(min-width: 45rem) 700px, 100vw"
                                      objectFit="cover"
                                      cropPosition={
                                        tour?.heroImage?.cropPosition
                                      }
                                    />
                                  </Box>
                                )}
                              </Box>
                            </AspectRatio>
                          </Box>
                          {!isMobile && tour?.heroImage?.credits !== "" && (
                            <Text
                              textStyle="finePrint"
                              mt="0.5"
                              px={isMobile ? "20px" : "35px"}
                            >
                              <MultiLangValue json={tour?.heroImage?.credits} />
                            </Text>
                          )}
                        </Flex>
                      }

                      <Box
                        px={isMobile ? "20px" : "35px"}
                        pt={isMobile ? "12px" : "35px"}
                        pb={isMobile ? "12px" : "20px"}
                        w={isMobile ? "100%" : "66.66%"}
                      >
                        {!isMobile && (
                          <>
                            <Flex
                              textStyle="categoriesHighlight"
                              color={color}
                              h="35px"
                              alignItems="flex-end"
                            >
                              {t("tour.title.aboutTheTour", "About the tour")}
                            </Flex>
                            <chakra.h2
                              mb="0.3em !important"
                              sx={{
                                a: {
                                  _hover: {
                                    color: "#333 !important",
                                  },
                                },
                              }}
                            >
                              <NextLink
                                passHref
                                href={`${
                                  i18n.language === "en" ? "/en" : ""
                                }/tour/${getMultilangValue(tour.slug)}/0`}
                              >
                                <LinkOverlay
                                  textStyle="headline"
                                  textDecoration="none"
                                  minH={isMobile ? "50px" : undefined}
                                  className={
                                    isMobile
                                      ? "clampTwoLines"
                                      : "clampFourLines"
                                  }
                                >
                                  <MultiLangValue json={tour.title} />
                                </LinkOverlay>
                              </NextLink>
                            </chakra.h2>
                          </>
                        )}
                        {isMobile && (
                          <NextLink
                            passHref
                            href={`${
                              i18n.language === "en" ? "/en" : ""
                            }/tour/${getMultilangValue(tour.slug)}/0`}
                          >
                            <LinkOverlay
                              textStyle="headline"
                              textDecoration="none"
                              className={
                                isMobile ? "clampTwoLines" : "clampFourLines"
                              }
                            >
                              <Flex
                                textStyle="categoriesHighlight"
                                color={color}
                                h={!isMobile ? "35px" : undefined}
                                alignItems="flex-end"
                              >
                                {t("tour.title.aboutTheTour", "About the tour")}
                              </Flex>
                            </LinkOverlay>
                          </NextLink>
                        )}
                      </Box>

                      <Box
                        pt={isMobile ? "0" : "35px"}
                        px={isMobile ? "20px" : "35px"}
                        pb={isMobile ? "20px" : "35px"}
                      >
                        <Flex
                          justifyContent="space-between"
                          position="relative"
                        >
                          <Box
                            w={isMobile ? "100%" : "85%"}
                            minH={isMobile ? "60px" : undefined}
                          >
                            {isMobile ? (
                              <Box fontWeight="bold">
                                <TrimmedTextWithBottomEdge
                                  text={teaser}
                                  edgeWidth={60}
                                  numLines={6}
                                />
                              </Box>
                            ) : (
                              <Box className="clampFourLines">{teaser}</Box>
                            )}
                          </Box>
                          <Box
                            alignSelf="flex-end"
                            sx={{
                              ...(isMobile
                                ? {
                                    position: "absolute",
                                    bottom: "-6px",
                                    right: 0,
                                  }
                                : {}),
                            }}
                          >
                            <SVG
                              type="arrow-right"
                              width={isMobile ? "30px" : "40px"}
                              height={isMobile ? "17px" : "22px"}
                            />
                          </Box>
                        </Flex>
                      </Box>
                    </LinkBox>
                  </Box>
                  <Box
                    key={`ts-facts`}
                    {...mobileCardWrapper}
                    pr="20px"
                    className="cardContainer"
                  >
                    <Box
                      as="article"
                      data-id="facts"
                      bg="#fff"
                      borderRadius="lg"
                      overflow="hidden"
                      w="100%"
                      maxW={isMobile && !fillContainer ? "275px" : "100%"}
                      h={isMobile && fillContainer ? "100%" : undefined}
                      className="svgHover"
                    >
                      <Flex
                        flexDirection={isMobile ? "column" : "row-reverse"}
                        alignItems={isMobile ? "flex-end" : "flex-start"}
                      >
                        <Box
                          w={isMobile ? "50%" : "33.33%"}
                          pb={isMobile ? "0px" : "20px"}
                        >
                          <AspectRatio w="100%" ratio={3 / 2}>
                            <Box bg={color}></Box>
                          </AspectRatio>
                        </Box>
                        <Box
                          px={isMobile ? "20px" : "35px"}
                          pt={isMobile ? "12px" : "35px"}
                          pb={isMobile ? "0px" : "20px"}
                          w={isMobile ? "100%" : "66.66%"}
                        >
                          <Flex
                            textStyle="categoriesTourStop"
                            color={color}
                            h="35px"
                            alignItems="flex-end"
                          ></Flex>
                          <chakra.h2
                            mb="0.3em !important"
                            sx={{
                              a: {
                                _hover: {
                                  color: "#333 !important",
                                },
                              },
                            }}
                          >
                            {t("tour.detail.facts", "About the tour")}
                          </chakra.h2>
                        </Box>
                      </Flex>

                      <Box
                        px={isMobile ? "20px" : "35px"}
                        pb={isMobile ? "20px" : "35px"}
                      >
                        {tour?.tourStops?.length > 0 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                            >
                              {t("tour.detail.label.stops", "Stops")}
                            </Box>
                            <Box textStyle="card">
                              {tour?.tourStops?.length}
                            </Box>
                          </Flex>
                        )}
                        {tour?.tourStops?.length > 0 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                            >
                              {t("tour.detail.label.start", "Start")}
                            </Box>
                            <Box textStyle="card">
                              <MultiLangValue json={tour?.tourStops[0].title} />
                            </Box>
                          </Flex>
                        )}
                        {tour?.tourStops?.length > 1 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                            >
                              {t("tour.detail.label.stop", "Stop")}
                            </Box>
                            <Box textStyle="card">
                              <MultiLangValue
                                json={
                                  tour?.tourStops[tour?.tourStops.length - 1]
                                    .title
                                }
                              />
                            </Box>
                          </Flex>
                        )}
                        {tour?.distance && tour?.duration && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                            >
                              {t("tour.detail.label.distance", "Distance")}
                            </Box>
                            <Box textStyle="card">
                              <MultiLangValue json={tour?.distance} /> |{" "}
                              <MultiLangValue json={tour?.duration} />
                            </Box>
                          </Flex>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {tour?.tourStops?.length > 0 &&
                    tour?.tourStops.map((tourStop: any) => (
                      <Box
                        key={`ts-${tourStop.number}`}
                        {...mobileCardWrapper}
                        pr="20px"
                        className="cardContainer"
                      >
                        <CardTourStop tourStop={tourStop} tour={tour} />
                      </Box>
                    ))}
                </Flex>
              </Box>
            </Box>
            <Box ref={footerRef}>
              <Footer noBackground />
            </Box>
          </Grid>
        </Box>
      )}
    </MainContent>
  );
};

export const ModuleTourGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

// This gets called on every request
export const ModuleTourGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: tourQuery,
    variables: {
      slug: context?.params?.slug,
    },
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

  if (!data?.tour)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      tour: data?.tour,
    },
    revalidate: 3600,
  };
};
