import { useEffect, useState, useRef, UIEvent, useCallback } from "react";

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ApiImage } from "~/components/ui/ApiImage";
import { TrimmedTextWithBottomEdge } from "~/components/ui/TrimmedTextWithBottomEdge";
import { CardTourStop } from "~/components/ui/CardTourStop";
import { SVG } from "~/components/ui/SVG";

import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
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
import { htmlToTrimmedString, getSeoAppTitle, getSeoImage, getMetaDescriptionContent } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import NextLink from "next/link";
import debounce from "lodash/debounce";
import { tourQuery, createTourStops } from "./tourShared";
import { PageTitle } from "../ui/PageTitle";

const MOBILE_CARD_WIDTH = 275;

export const ModuleComponentTour = ({ tour }: { tour: any; }) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const [fillContainer, setFillContainer] = useState(true);

  const isMobileRef = useRef<boolean>(false);
  const observeVScrollPositionRef = useRef<boolean>(false);
  const containersRef = useRef<any>(null);
  const parsedTourStopsRef = useRef<any>(null);
  const currentHighlightIndexRef = useRef<number>(-2);
  const footerRef = useRef<HTMLDivElement>(null);
  const tourStopsCardsContainerRef = useRef<HTMLDivElement>(null);

  const [opacity, setOpacity] = useState(isMobile ? 0 : 1);

  const scrollState = useScrollStateContext();

  const mobileCardWrapper = isMobile
    ? { flexBasis: "295px", minW: "295px", maxW: "295px" }
    : {};

  const onResize = useCallback(() => {
    if (
      !tourStopsCardsContainerRef.current ||
      !containersRef.current ||
      !footerRef.current
    )
      return;

    const isMobile = window.matchMedia("(max-width: 44.999em)").matches;
    isMobileRef.current = isMobile;

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

      tourStopsCardsContainerRef.current.style.paddingBottom = "";
    } else {
      if (containersRef.current?.length) {
        tourStopsCardsContainerRef.current.style.paddingBottom = "";
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
          tourStopsCardsContainerRef.current.style.paddingBottom = `${pB}px`;
        } else {
          tourStopsCardsContainerRef.current.style.paddingBottom = "";
        }
      } else {
        tourStopsCardsContainerRef.current.style.paddingBottom = "";
      }
    }
  }, []);
  const onResizeDebounced = debounce(onResize, 350);

  const onScroll = () => {
    if (
      isMobileRef.current ||
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

      if (currentHighlightIndexRef.current !== newIndex) {
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

        currentHighlightIndexRef.current = newIndex;
      }
    }
  };

  const onVerticalScroll = (scrollLeft: number) => {
    if (tour?.tourStops?.length && cultureMap) {
      if (!observeVScrollPositionRef.current) return;

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

      if (currentHighlightIndexRef.current !== newIndex) {
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
            !isMobileRef.current,
            isMobileRef.current
          );
        }
        currentHighlightIndexRef.current = newIndex;
      }
    }
  };

  useEffect(() => {
    observeVScrollPositionRef.current = false;

    if (typeof window === "undefined" || !tourStopsCardsContainerRef.current)
      return;

    containersRef.current =
      tourStopsCardsContainerRef.current.querySelectorAll(".cardContainer");

    window.addEventListener("resize", onResizeDebounced);
    window.addEventListener("scroll", onScroll);

    onResize();

    const triggerOnResize = () => {
      onResize();
    };
    document.addEventListener("DOMContentLoaded", triggerOnResize);

    // if (isMobileRef.current) {

    setTimeout(() => {
      onResize();
      onScroll();
    }, 100);

    return () => {
      if (typeof window === "undefined") return;
      window.removeEventListener("resize", onResizeDebounced);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("DOMContentLoaded", triggerOnResize);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cultureMap) {
      cultureMap.clearOnloadJobs();
      cultureMap.hideCurrentView();
    }
    currentHighlightIndexRef.current = -2;

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions

    return () => {
      if (cultureMap) {
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
          (!scrollState.wasBack() && isMobileRef.current) ||
          (!isMobileRef.current &&
            typeof window !== "undefined" &&
            window.scrollY === 0)
        ) {
          cultureMap.setInitallyFitToBounds(false);
          cultureMap.panTo(
            stops[0].lng,
            stops[0].lat,
            !isMobileRef.current,
            isMobileRef.current
          );
          scrollState.set("vertical", router.asPath.replace(/[^a-z]/g, ""), 0);
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
    tour?.tourStops,
    tour?.path,
    settings,
    cultureMap,
    config,
    getMultilangValue,
    tour?.slug,
  ]);

  useEffect(() => {
    setTimeout(() => {
      const scrollLeft = scrollState.get(
        "vertical",
        router.asPath.replace(/[^a-z]/g, "")
      );

      observeVScrollPositionRef.current = true;
      tourStopsCardsContainerRef.current?.scrollTo({
        left: scrollState.wasBack() && scrollLeft ? scrollLeft : 0,
        top: 0,
        behavior: "auto",
      });

      if (!scrollState.wasBack()) setOpacity(1);

      setTimeout(() => {
        if (tourStopsCardsContainerRef.current)
          tourStopsCardsContainerRef.current.style.scrollBehavior = "smooth";

        setOpacity(1);
      }, 200);
    }, 60);
  }, [router.asPath, scrollState]);

  let color = config.colorDark;

  const teaser = htmlToTrimmedString(getMultilangHtml(tour.teaser) ?? "", 200);

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/tour/${getMultilangValue(tour?.slug)}`}
        title={`${getMultilangValue(tour?.title)} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(tour?.metaDesc),
          getMultilangValue(tour?.description)
        )}
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
          opacity={opacity}
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
                  h1={isMobile}
                  title={
                    isMobile
                      ? getMultilangValue(tour?.title)
                      : t("tour.title.tour", "Tour")
                  }
                  type="short"
                  center={isMobile}
                  backlink
                  url={i18n.language === "en" ? "/en/tours" : "/touren"}
                />
              </Box>

              <Box
                w="100%"
                pl={isMobile ? "0px" : "20px"}
                pb="20px"
                mb={isMobile ? "40px" : "0px"}
              >
                <Flex
                  overflowY={isMobile ? "auto" : "hidden"}
                  flexDirection={isMobile ? "row" : "column"}
                  className="cardsContainer"
                  sx={{
                    scrollSnapType: "x mandatory",
                    scrollBehavior: "auto",
                  }}
                  w="100%"
                  tabIndex={isMobile ? 0 : undefined}
                  role="group"
                  aria-labelledby="title"
                  ref={tourStopsCardsContainerRef}
                  pb={isMobile ? "20px" : undefined}
                  onScroll={
                    isMobile
                      ? (e: UIEvent<HTMLDivElement>) => {
                          const scrollLeft = (e.target as any).scrollLeft;
                          onVerticalScroll(scrollLeft);
                        }
                      : undefined
                  }
                >
                  <Box
                    key={`ts-intro`}
                    {...mobileCardWrapper}
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
                              px={{
                                base: "20px",
                                md: "30px",
                                "2xl": "35px",
                              }}
                            >
                              {t('text.photo.credits', 'Photo')}: <MultiLangValue json={tour?.heroImage?.credits} />
                            </Text>
                          )}
                        </Flex>
                      }

                      <Box
                        px={{
                          base: "20px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                        pt={{
                          base: "12px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                        pb={isMobile ? "12px" : "20px"}
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
                            <chakra.h1
                              mb="0.3em !important"
                              sx={{
                                a: {
                                  _hover: {
                                    color: "#333 !important",
                                  },
                                },
                              }}
                            >
                            <LinkOverlay
                                as={NextLink}
                                href={`${
                                  i18n.language === "en" ? "/en" : ""
                                }/tour/${getMultilangValue(tour.slug)}/0`}
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
                            </chakra.h1>
                          </>
                        )}
                        {isMobile && (
                          <LinkOverlay
                            as={NextLink}
                            href={`${
                              i18n.language === "en" ? "/en" : ""
                            }/tour/${getMultilangValue(tour.slug)}/0`}
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
                        )}
                      </Box>

                      <Box
                        pt={{
                          base: "0px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                        px={{
                          base: "20px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                        pb={{
                          base: "20px",
                          md: "30px",
                          "2xl": "35px",
                        }}
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
                              width={isMobile ? 30 : 40}
                              height={isMobile ? 17 : 22}
                            />
                          </Box>
                        </Flex>
                      </Box>
                    </LinkBox>
                  </Box>
                  <Box
                    key={`ts-facts`}
                    {...mobileCardWrapper}
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
                          px={{
                            base: "20px",
                            md: "30px",
                            "2xl": "35px",
                          }}
                          pt={{
                            base: "12px",
                            md: "30px",
                            "2xl": "35px",
                          }}
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
                        px={{
                          base: "20px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                        pb={{
                          base: "20px",
                          md: "30px",
                          "2xl": "35px",
                        }}
                      >
                        {tour?.tourStops?.length > 0 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                              flexShrink={0}
                            >
                              {t("tour.detail.label.stops", "Stops")}
                            </Box>
                            <Box textStyle="card">
                              {tour?.tourStops?.length}
                            </Box>
                          </Flex>
                        )}
                        {!isMobile && tour?.tourStops?.length > 0 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                              flexShrink={0}
                            >
                              {t("tour.detail.label.start", "Start")}
                            </Box>
                            <Box textStyle="card">
                              <MultiLangValue json={tour?.tourStops[0].title} />
                            </Box>
                          </Flex>
                        )}
                        {!isMobile && tour?.tourStops?.length > 1 && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                              flexShrink={0}
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
                        {tour?.distance && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                              flexShrink={0}
                            >
                              {t("tour.detail.label.distance", "Distance")}
                            </Box>
                            <Box textStyle="card">
                              <MultiLangValue json={tour?.distance} />
                            </Box>
                          </Flex>
                        )}
                        {tour?.duration && (
                          <Flex alignItems="center" mb="0.25em">
                            <Box
                              color="cm.accentDark"
                              textTransform="uppercase"
                              textStyle="categories"
                              w="100px"
                              flexShrink={0}
                            >
                              {t("tour.detail.label.duration", "Duration")}
                            </Box>
                            <Box textStyle="card">
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
                        className="cardContainer"
                        onClick={(e) => {
                          let container;
                          let parent: any = (e.target as any).parentNode;
                          let count = 20;
                          while (!container) {
                            if (!parent) break;
                            if (parent.classList.contains("cardContainer")) {
                              container = parent;
                              break;
                            }
                            parent = parent?.parentNode;
                            count -= 1;
                            if (count === 0) break;
                          }

                          if (container) {
                            scrollState.set(
                              "vertical",
                              router.asPath.replace(/[^a-z]/g, ""),
                              container.offsetLeft
                            );
                          }
                        }}
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
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 3600,
  };
};
