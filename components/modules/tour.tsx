import { useEffect, useState, useRef, UIEvent } from "react";
import { gql } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  TrimmedTextWithBottomEdge,
  ApiImage,
  CardTourStop,
  SVG,
  Images,
} from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import {
  useMapContext,
  useConfigContext,
  useSettingsContext,
} from "~/provider";
import {
  Box,
  Flex,
  AspectRatio,
  LinkBox,
  Text,
  IconButton,
  LinkOverlay,
  chakra,
  Grid,
} from "@chakra-ui/react";
import { htmlToTrimmedString } from "~/utils";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { getLocationColors } from "~/utils";
import NextLink from "next/link";

const MOBILE_CARD_WIDTH = 275;

const tourQuery = gql`
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

const createTourStops = (
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
      title: ts?.location?.title,
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

export const ModuleComponentTour = ({
  tour,
  ...props
}: {
  tour: any;
  props: any;
}) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const [fillContainer, setFillContainer] = useState(true);

  const containersRef = useRef<any>(null);
  const parsedTourStopsRef = useRef<any>(null);
  const currentHightlightIndexRef = useRef<number>(0);
  const tourStopsRef = useRef<HTMLDivElement>(null);
  const tourStopsCardsContainerRef = useRef<HTMLDivElement>(null);

  const [tourCards, setTourCards] = useState<any[]>([]);
  const [currentHightlightIndex, setCurrentHightlightIndex] = useState(0);

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  useEffect(() => {
    console.log("mount tour");
    if (cultureMap) cultureMap.hideCurrentView();

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions
    // TODO: this is on mount call back
    // setTourStop(null)
    return () => {
      console.log("unmount tour");
      if (cultureMap) {
        cultureMap.showCurrentView();
        cultureMap.clearTour();
      }
    };
  }, [router.asPath, cultureMap]);

  // useEffect(() => {
  //   if (cultureMap) cultureMap.hideCurrentView();

  //   return () => {
  //     if (cultureMap) cultureMap.showCurrentView();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const onResize = debounce(() => {
    if (
      !tourStopsRef.current ||
      !tourStopsCardsContainerRef.current ||
      !containersRef.current
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
          window.innerHeight -
            (isTablet ? 100 : 120) -
            (document.documentElement.scrollHeight -
              containersRef.current[containersRef.current.length - 1].offsetTop)
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
  }, 350);

  const onScroll = () => {
    if (
      isMobile ||
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

        cultureMap.setTour(tour?.path, stops);
        currentHightlightIndexRef.current = newIndex;

        if (parsedTourStopsRef.current?.[Math.max(newIndex, 0)]) {
          cultureMap.panTo(
            parsedTourStopsRef.current?.[Math.max(newIndex, 0)].lng,
            parsedTourStopsRef.current?.[Math.max(newIndex, 0)].lat,
            !isMobile
          );
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !tourStopsCardsContainerRef.current)
      return;

    containersRef.current =
      tourStopsCardsContainerRef.current.querySelectorAll(".cardContainer");

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

    if (tour?.tourStops?.length > 0 && settings && cultureMap) {
      if (tour?.path) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          -1,
          settings
        );

        cultureMap.setTour(tour?.path, stops);
        cultureMap.fitToCurrentTourBounds();

        const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
        setTimeout(() => {
          cultureMap.panTo(stops[0].lng, stops[0].lat, !isMobile, isMobile);
        }, 500);

        parsedTourStopsRef.current = stops;
      }
    }
    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [
    tour?.tourStops,
    tour?.path,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
  ]);

  let meta: any = t("card.meta.tour", "Tour");
  let color = config.colorDark;

  const teaser = htmlToTrimmedString(getMultilangHtml(tour.teaser) ?? "", 200);

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
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
                        if (tour?.tourStops?.length && cultureMap) {
                          const scrollLeft = (e.target as any).scrollLeft;

                          let newIndex = -1;
                          if (
                            scrollLeft - (MOBILE_CARD_WIDTH + 20) * 1.75 >
                            0
                          ) {
                            newIndex = Math.floor(
                              (scrollLeft -
                                (MOBILE_CARD_WIDTH + 20) * 2.5 +
                                (MOBILE_CARD_WIDTH + 20) * 0.75) /
                                (MOBILE_CARD_WIDTH + 20)
                            );
                          }

                          if (currentHightlightIndex !== newIndex) {
                            if (
                              parsedTourStopsRef.current?.[
                                Math.max(newIndex, 0)
                              ]
                            ) {
                              const stops = createTourStops(
                                tour?.tourStops,
                                getMultilangValue(tour?.slug),
                                newIndex,
                                settings
                              );

                              cultureMap.setTour(tour?.path, stops);
                              cultureMap.panTo(
                                parsedTourStopsRef.current[
                                  Math.max(newIndex, 0)
                                ].lng,
                                parsedTourStopsRef.current[
                                  Math.max(newIndex, 0)
                                ].lat,
                                !isMobile,
                                isMobile
                              );
                              setCurrentHightlightIndex(newIndex);
                            }
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
                      // w: "auto",
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
                                      alt={tour?.heroImage?.alt}
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
            <Footer noBackground />
          </Grid>
        </Box>
      )}
    </MainContent>
  );
};

export const ModuleComponentTourStop = ({
  tour,
  tourStop,
  ...props
}: {
  tour: any;
  tourStop: any;
  props: any;
}) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();

  const [color, setColor] = useState("#333");
  const [colorDark, setColorDark] = useState(config.colorDark);

  useEffect(() => {
    console.log("mount tour stop");
    if (cultureMap) cultureMap.hideCurrentView();

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions
    // TODO: this is on mount call back
    // setTourStop(null)
    return () => {
      console.log("unmount tourstop");
      if (cultureMap) {
        cultureMap.showCurrentView();
        cultureMap.clearTour();
      }
    };
  }, [router.asPath, cultureMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const { color, colorDark } = getLocationColors(
      tourStop?.location,
      settings
    );

    if (tour?.tourStops?.length > 0 && settings && cultureMap) {
      const currentStop = tour?.tourStops.find(
        (s: any) => s.number === tourStop?.number
      );

      if (tour?.path) {
        const stops = createTourStops(
          tour?.tourStops,
          getMultilangValue(tour?.slug),
          currentStop?.number ? parseInt(currentStop?.number) - 1 : -1,
          settings
        );

        cultureMap.setTour(tour?.path, stops);

        if (
          currentStop &&
          currentStop?.location?.lng &&
          currentStop?.location?.lat
        ) {
          console.log("currentStop", currentStop);
          const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
          cultureMap.panTo(
            currentStop?.location?.lng,
            currentStop?.location?.lat,
            !isMobile,
            isMobile
          );
        }
      }
    }

    if (color) setColor(color);

    if (colorDark) setColorDark(colorDark);

    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [
    tour?.tourStops,
    tour?.path,
    tourStop,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
  ]);

  let meta: any = t("card.meta.tour", "Tour");

  return (
    <MainContent layerStyle="lightGray">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box px="20px" pt="0.5em">
          <Box mb="3">
            <Text className="highlight" color="cm.text" fontWeight="bold">
              {getMultilangValue(tour?.title)}
            </Text>
          </Box>

          <Box bg="#fff" borderRadius="lg" overflow="hidden">
            {tourStop?.heroImage?.id && (
              <Box>
                <AspectRatio w="100%" ratio={16 / 9}>
                  <Box bg={color}>
                    {tourStop?.heroImage && tourStop?.heroImage?.id && (
                      <Box w="100%" h="100%">
                        <ApiImage
                          id={tourStop?.heroImage?.id}
                          alt={tourStop?.heroImage?.alt}
                          meta={tourStop?.heroImage?.meta}
                          forceAspectRatioPB={56.25}
                          status={tourStop?.heroImage?.status}
                          sizes="(min-width: 45rem) 700px, 100vw"
                          cropPosition={tourStop?.heroImage?.cropPosition}
                          objectFit="cover"
                        />
                      </Box>
                    )}
                  </Box>
                </AspectRatio>
                {tourStop?.heroImage?.credits !== "" && (
                  <Text
                    textStyle="finePrint"
                    mt="0.5"
                    px={isMobile ? "20px" : "35px"}
                  >
                    <MultiLangValue json={tourStop?.heroImage?.credits} />
                  </Text>
                )}
              </Box>
            )}
            {!tourStop?.heroImage?.id && (
              <Flex justifyContent="flex-end">
                <Box w="40%">
                  <AspectRatio w="100%" ratio={4 / 3}>
                    <Box bg={color}></Box>
                  </AspectRatio>
                </Box>
              </Flex>
            )}

            <Box
              px={isMobile ? "20px" : "35px"}
              pt={isMobile ? "20px" : "35px"}
              pb={isMobile ? "20px" : "1em"}
              w="100%"
            >
              {meta && (
                <Flex
                  textStyle="categoriesHighlight"
                  color={colorDark}
                  alignItems="flex-end"
                  width="66.66%"
                >
                  {t("tour.tourStop.meta", "Tour stop {{number}}", {
                    number: tourStop?.number,
                  })}
                </Flex>
              )}
              <Flex justifyContent="space-between">
                <chakra.h1
                  mb="0.3em !important"
                  textStyle="headline"
                  sx={{
                    a: {
                      _hover: {
                        color: "#333 !important",
                      },
                    },
                  }}
                  w="90%"
                >
                  <MultiLangValue json={tourStop.title} />
                </chakra.h1>
                <IconButton
                  aria-label={t("tour.backToTour", "Back to tour")}
                  icon={
                    <SVG
                      type="cross"
                      width={isMobile ? "50px" : "80px"}
                      height={isMobile ? "50px" : "80px"}
                    />
                  }
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
                  onClick={() => {
                    router.push(`/tour/${getMultilangValue(tour?.slug)}`);
                  }}
                  transition="all 0.3s"
                  _hover={{
                    bg: "transparent",
                  }}
                  _active={{
                    bg: "transparent",
                  }}
                  transform={
                    isMobile ? "translateY(-5px) translateX(5px)" : undefined
                  }
                />
              </Flex>
            </Box>

            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="1em"
            >
              {tourStop.teaser && (
                <Box textStyle="larger" mb="1em" fontWeight="bold">
                  <MultiLangHtml json={tourStop.teaser} />
                </Box>
              )}

              <MultiLangHtml json={tourStop.description} />
            </Box>

            {tourStop?.images?.length > 0 && (
              <Box mt="0.5em">
                <Images images={tourStop?.images} />
              </Box>
            )}
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};

export const ModuleComponentTourIntroduction = ({
  tour,
  ...props
}: {
  tour: any;
  props: any;
}) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();

  const [color, setColor] = useState("#333");
  const [colorDark, setColorDark] = useState(config.colorDark);

  useEffect(() => {
    console.log("mount tour stop");
    if (cultureMap) cultureMap.hideCurrentView();

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions
    // TODO: this is on mount call back
    // setTourStop(null)
    return () => {
      console.log("unmount tourstop");
      if (cultureMap) {
        cultureMap.showCurrentView();
        cultureMap.clearTour();
      }
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

        cultureMap.setTour(tour?.path, stops);

        const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
        cultureMap.panTo(stops[0]?.lng, stops[0]?.lat, !isMobile, isMobile);
      }
    }

    if (color) setColor(color);

    if (colorDark) setColorDark(colorDark);

    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [
    tour?.tourStops,
    tour?.path,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
    color,
    colorDark,
  ]);

  let meta: any = t("card.meta.tour", "Tour");

  return (
    <MainContent layerStyle="lightGray">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box px="20px" pt="0.5em">
          <Box mb="3">
            <Text className="highlight" color="cm.text" fontWeight="bold">
              {getMultilangValue(tour?.title)}
            </Text>
          </Box>

          <Box bg="#fff" borderRadius="lg" overflow="hidden">
            {tour?.heroImage?.id && (
              <Box>
                <AspectRatio w="100%" ratio={16 / 9}>
                  <Box bg={color}>
                    {tour?.heroImage && tour?.heroImage?.id && (
                      <Box w="100%" h="100%">
                        <ApiImage
                          id={tour?.heroImage?.id}
                          alt={tour?.heroImage?.alt}
                          meta={tour?.heroImage?.meta}
                          forceAspectRatioPB={56.25}
                          status={tour?.heroImage?.status}
                          sizes="(min-width: 45rem) 700px, 100vw"
                          cropPosition={tour?.heroImage?.cropPosition}
                          objectFit="cover"
                        />
                      </Box>
                    )}
                  </Box>
                </AspectRatio>
                {tour?.heroImage?.credits !== "" && (
                  <Text
                    textStyle="finePrint"
                    mt="0.5"
                    px={isMobile ? "20px" : "35px"}
                  >
                    <MultiLangValue json={tour?.heroImage?.credits} />
                  </Text>
                )}
              </Box>
            )}
            {!tour?.heroImage?.id && (
              <Flex justifyContent="flex-end">
                <Box w="40%">
                  <AspectRatio w="100%" ratio={4 / 3}>
                    <Box bg={color}></Box>
                  </AspectRatio>
                </Box>
              </Flex>
            )}

            <Box
              px={isMobile ? "20px" : "35px"}
              pt={isMobile ? "20px" : "35px"}
              pb={isMobile ? "20px" : "1em"}
              w="100%"
            >
              {meta && (
                <Flex
                  textStyle="categoriesHighlight"
                  color={colorDark}
                  alignItems="flex-end"
                  width="66.66%"
                >
                  {t("tour.introduction", "Introduction")}
                </Flex>
              )}

              <Flex justifyContent="space-between" w="100%">
                <chakra.h1
                  mb="0.3em !important"
                  textStyle="headline"
                  sx={{
                    a: {
                      _hover: {
                        color: "#333 !important",
                      },
                    },
                  }}
                  w="90%"
                >
                  <MultiLangValue json={tour.title} />
                </chakra.h1>
                <IconButton
                  aria-label={t("tour.backToTour", "Back to tour")}
                  icon={
                    <SVG
                      type="cross"
                      width={isMobile ? "50px" : "80px"}
                      height={isMobile ? "50px" : "80px"}
                    />
                  }
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
                  onClick={() => {
                    router.push(`/tour/${getMultilangValue(tour?.slug)}`);
                  }}
                  transition="all 0.3s"
                  _hover={{
                    bg: "transparent",
                  }}
                  _active={{
                    bg: "transparent",
                  }}
                  transform={
                    isMobile ? "translateY(-3px) translateX(5px)" : "translateY(-22px) translateX(5px)"
                  }
                />
              </Flex>
            </Box>

            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="1em"
            >
              {tour.teaser && (
                <Box textStyle="larger" mb="1em" fontWeight="bold">
                  <MultiLangHtml json={tour.teaser} />
                </Box>
              )}

              <MultiLangHtml json={tour.description} />
            </Box>
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
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

// This gets called on every request
export const ModuleTourStopGetStaticProps: GetStaticProps = async (context) => {
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

  const stop = parseInt(
    context?.params?.stop
      ? Array.isArray(context?.params?.stop)
        ? context?.params?.stop[0]
        : context?.params?.stop
      : "-1"
  );

  if (
    !data?.tour ||
    !(stop >= 0 && data?.tour && stop <= data?.tour?.tourStops?.length)
  )
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      tour: data?.tour,
      tourStop: data?.tour?.tourStops?.[stop - 1] ?? null,
    },
    revalidate: 3600,
  };
};
