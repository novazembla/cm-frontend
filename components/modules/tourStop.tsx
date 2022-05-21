import { useEffect, useState } from "react";

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ApiImage } from "~/components/ui/ApiImage";
import { Images } from "~/components/ui/Images";
import { SVG } from "~/components/ui/SVG";
import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { CardLocation } from "~/components/ui/CardLocation";

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
  Text,
  IconButton,
  chakra,
  Grid,
  Button,
} from "@chakra-ui/react";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { getLocationColors, getMetaDescriptionContent, getSeoAppTitle, getSeoImage } from "~/utils";

import { tourQuery, createTourStops } from "./tourShared";

import NextHeadSeo from "next-head-seo";
import { PageTitle } from "~/components/ui/PageTitle";
import { ShareIcons } from "../ui/ShareIcons";

export const ModuleComponentTourStop = ({
  tour,
  tourStop,
}: {
  tour: any;
  tourStop: any;
}) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n, getMultilangValue } = useAppTranslations();

  const [color, setColor] = useState("#333");
  const [colorDark, setColorDark] = useState(config.colorDark);

  const scrollState = useScrollStateContext();

  const onNavigationButtonClick = () => {
    if (scrollState.getPreviousPath()) {
      if (router.asPath.indexOf(scrollState.getPreviousPath()) > -1) {
        router.back();
      } else {
        router.push(`/tour/${getMultilangValue(tour?.slug)}`);
      }
    } else {
      router.push(`/tour/${getMultilangValue(tour?.slug)}`);
    }
  };

  useEffect(() => {
    if (cultureMap) {
      cultureMap.clearOnloadJobs();
      cultureMap.hideCurrentView();
    }

    return () => {
      if (cultureMap) cultureMap.clearTour();
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

        cultureMap.setTourPath(tour?.path);
        cultureMap.setTourStops(stops);

        if (
          currentStop &&
          currentStop?.location?.lng &&
          currentStop?.location?.lat
        ) {
          setTimeout(() => {
            const commingFromTour =
              scrollState.getPreviousPath() !== "" &&
              router.asPath.indexOf(scrollState.getPreviousPath()) > -1;

            cultureMap.panTo(
              currentStop?.location?.lng,
              currentStop?.location?.lat,
              !commingFromTour,
              commingFromTour
            );
          }, 500);
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
    router.asPath,
    scrollState,
  ]);

  let meta: any = t("card.meta.tour", "Tour");

  const image = (tourStop?.heroImage && tourStop?.heroImage.id) ? 
      tourStop?.heroImage : 
      (tourStop?.location?.heroImage && tourStop?.location?.heroImage.id) 
        ? tourStop?.location?.heroImage
        : null;

  return (
    <MainContent layerStyle="lightGray">
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/tour/${getMultilangValue(tour?.slug)}/${tourStop?.number}`}
        title={`${tourStop?.number} - ${getMultilangValue(
          tourStop?.title
        )} - ${getMultilangValue(tour?.title)} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(tourStop?.metaDesc),
          getMultilangValue(tourStop?.teaser)
        )}
        og={{
          image: getSeoImage(tourStop?.heroImage),
        }}
      />
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box>
          <Box px="20px" pt="0.5em">
            <PageTitle title={getMultilangValue(tour?.title)} type="short" />

            <Box bg="#fff" borderRadius="lg" overflow="hidden">
              {image?.id && (
                <Box>
                  <AspectRatio w="100%" ratio={16 / 9}>
                    <Box bg={color}>
                      {image.id && (
                        <Box w="100%" h="100%">
                          <ApiImage
                            id={image?.id}
                            alt={getMultilangValue(image.alt)}
                            meta={image?.meta}
                            forceAspectRatioPB={56.25}
                            status={image?.status}
                            sizes="(min-width: 45rem) 700px, 100vw"
                            cropPosition={image?.cropPosition}
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
                      px={{
                        base: "20px",
                        md: "30px",
                        "2xl": "35px",
                      }}
                    >
                      {t('text.photo.credits', 'Photo')}: <MultiLangValue json={tourStop?.heroImage?.credits} />
                    </Text>
                  )}
                </Box>
              )}
              {!image?.id && (
                <Flex justifyContent="flex-end">
                  <Box w="40%">
                    <AspectRatio w="100%" ratio={4 / 3}>
                      <Box bg={color}></Box>
                    </AspectRatio>
                  </Box>
                </Flex>
              )}

              <Box
                px={{
                  base: "20px",
                  md: "30px",
                  "2xl": "35px",
                }}
                pt={{
                  base: "20px",
                  md: "30px",
                  "2xl": "35px",
                }}
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
                    className="svgHover tabbedFocus"
                    _focus={{
                      bg: "transparent",
                      boxShadow: "none",
                    }}
                    paddingInlineStart="0"
                    paddingInlineEnd="0"
                    padding="0"
                    bg="transparent"
                    w={isMobile ? "30px" : "40px"}
                    h={isMobile ? "30px" : "40px"}
                    minW="30px"
                    overflow="hidden"
                    onClick={onNavigationButtonClick}
                    transition="background-color 0.3s"
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
                  md: "30px",
                  "2xl": "35px",
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

              <Box
                p={{
                  base: "20px",
                  md: "30px",
                  "2xl": "35px",
                }}
              >
                <Button onClick={onNavigationButtonClick} variant="ghost">
                  {t("tour.button.viewAllTourStops", "View all tour stops")}
                </Button>
              </Box>

              <Box
                p={{
                  base: "20px",
                  md: "30px",
                  "2xl": "35px",
                }}
              >
                <ShareIcons
                  title={getMultilangValue(tour.title)}
                  url={`${config.baseUrl}${
                    i18n.language === "en" ? "/en/tour" : "/tour"
                  }/${getMultilangValue(tour.slug)}/${tourStop?.number}`}
                />
              </Box>
            </Box>
          </Box>
          {tourStop?.location?.id && (
            <Box p="20px">
              <PageTitle
                title={t("event.title.location", "Location")}
                type="short"
              />

              <CardLocation
                key={`loc-${tourStop?.location.id}`}
                location={tourStop?.location}
              />
            </Box>
          )}
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};

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
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 300,
  };
};
