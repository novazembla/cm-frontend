import { useEffect, useState } from "react";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  SVG,
  Images,
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
  Text,
  IconButton,
  chakra,
  Grid,
} from "@chakra-ui/react";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { getLocationColors } from "~/utils";

import { tourQuery, createTourStops } from ".";

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
  const { t, getMultilangValue } = useAppTranslations();

  const [color, setColor] = useState("#333");
  const [colorDark, setColorDark] = useState(config.colorDark);

  const scrollState = useScrollStateContext();

  useEffect(() => {
    console.log("mount tour stop");
    if (cultureMap) cultureMap.hideCurrentView();

    return () => {
      console.log("unmount tourstop");
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
            cultureMap.panTo(
              currentStop?.location?.lng,
              currentStop?.location?.lat,
              true
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
                    console.log(scrollState.getPreviousPath());

                    if (scrollState.getPreviousPath()) {
                      if (
                        router.asPath.indexOf(scrollState.getPreviousPath()) >
                        -1
                      ) {
                        router.back();
                      } else {
                        router.push(`/tour/${getMultilangValue(tour?.slug)}`);
                      }
                    } else {
                      router.push(`/tour/${getMultilangValue(tour?.slug)}`);
                    }
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