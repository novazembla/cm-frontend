import { useEffect, useState } from "react";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ApiImage } from "~/components/ui/ApiImage";
import { SVG } from "~/components/ui/SVG";
import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
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
import { useRouter } from "next/router";
import { getSeoAppTitle, getSeoImage } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { createTourStops } from "./tourShared";
import { PageTitle } from "~/components/ui/PageTitle";

export const ModuleComponentTourIntroduction = ({ tour }: { tour: any }) => {
  const cultureMap = useMapContext();
  const router = useRouter();
  const { isMobile } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, getMultilangValue, i18n } = useAppTranslations();

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
    if (cultureMap) cultureMap.hideCurrentView();

    // As next.js doesn't unmount/remount if only components route changes we
    // need to rely on router.asPath to trigger in between tour change actions
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
        cultureMap.setTourStops(stops);

        // setTimeout(() => {
        //   cultureMap.panTo(
        //     stops[0]?.lng, stops[0]?.lat,
        //     true
        //   );
        // }, 500);
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
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/tour/${getMultilangValue(tour?.slug)}/0`}
        title={`${t("tour.introduction", "Introduction")} - ${getMultilangValue(
          tour?.title
        )} - ${getSeoAppTitle(t)}`}
        description={getMultilangValue(tour?.teaser)}
        og={{
          image: getSeoImage(tour?.heroImage),
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
        <Box px="20px" pt="0.5em">
          <PageTitle title={getMultilangValue(tour?.title)} type="short" />

          <Box bg="#fff" borderRadius="lg" overflow="hidden">
            {tour?.heroImage?.id && (
              <Box>
                <AspectRatio w="100%" ratio={16 / 9}>
                  <Box bg={color}>
                    {tour?.heroImage && tour?.heroImage?.id && (
                      <Box w="100%" h="100%">
                        <ApiImage
                          id={tour?.heroImage?.id}
                          alt={getMultilangValue(tour?.heroImage.alt)}
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
                    px={{
                      base: "20px",
                      md: "30px",
                      "2xl": "35px",
                    }}
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
                    isMobile
                      ? "translateY(-3px) translateX(5px)"
                      : "translateY(-22px) translateX(5px)"
                  }
                />
              </Flex>
            </Box>

            <Box
              px={{
                base: "20px",
                md: "30px",
                "2xl": "35px"
              }}
              pb="1em"
            >
              {tour.teaser && (
                <Box textStyle="larger" mb="1em" fontWeight="bold">
                  <MultiLangHtml json={tour.teaser} />
                </Box>
              )}

              <MultiLangHtml json={tour.description} />

              <Box textAlign="right" mt="2em">
                <Button onClick={onNavigationButtonClick} variant="ghost">
                  {t("tour.button.viewAllTourStops", "View all tour stops")}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};
