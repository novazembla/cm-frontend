import { useEffect, useState, useRef, UIEvent } from "react";
import { gql } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  CardTourStop,
} from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import {
  useMapContext,
  useConfigContext,
  useSettingsContext,
} from "~/provider";
import { Box, Flex, AspectRatio, Text, chakra, Grid } from "@chakra-ui/react";
import { isEmptyHtml } from "~/utils";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { debounce } from "lodash";
import { getLocationColors } from "~/utils";

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
  const { t, i18n, getMultilangHtml } = useAppTranslations();
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
      if (cultureMap) cultureMap.showCurrentView();
    };
  }, [router.asPath, cultureMap]);

  // useEffect(() => {
  //   if (cultureMap) cultureMap.hideCurrentView();

  //   return () => {
  //     if (cultureMap) cultureMap.showCurrentView();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;


    if (tour?.tourStops?.length > 0 && settings && cultureMap) {
      if (tour?.path) {
        const stops = tour?.tourStops?.map((ts: any, index: number) => ({
          number: ts?.number,
          id: ts?.location.id,
          lng: ts?.location?.lng,
          lat: ts?.location?.lat,
          title: ts?.location?.title,
          slug: ts?.location?.slug,
          color: getLocationColors(ts?.location, settings).color,
        })).sort((a: any, b: any) => {
          if (a?.number < b?.number) return -1;
          if (a?.number > b?.number) return 1;
          return 0;
        });

        console.log(stops, tour?.path);

        cultureMap.setTour(tour?.path, stops);

        cultureMap.panTo(
          stops[0].lng,
          stops[0].lat,
          !window.matchMedia("(max-width: 44.999em)").matches
        );
        parsedTourStopsRef.current = stops;
      }
    }
    return () => {
      if (cultureMap) cultureMap.clearHighlights();
    };
  }, [tour?.tourStops, tour?.path, settings, cultureMap, config]);

  let meta: any = t("card.meta.tour", "Tour");
  let color = config.colorDark;

  return (
    <MainContent
      isDrawer={isTablet || isDesktopAndUp}
      isVerticalContent={!isTablet && !isDesktopAndUp}
    >
      {tour?.tourStop?.length > 0 && (
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
                textAlign={isMobile ? "center" : undefined}
                fontWeight="bold"
              >
                {t("tour.title.tour", "Tour")}
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
                          let newIndex = Math.floor(
                            (scrollLeft + (MOBILE_CARD_WIDTH + 20) * 0.5) /
                              (MOBILE_CARD_WIDTH + 20)
                          );

                          if (
                            currentHightlightIndex !== newIndex &&
                            parsedTourStopsRef.current?.[newIndex]
                          ) {
                            cultureMap.panTo(
                              parsedTourStopsRef.current[newIndex].lng,
                              parsedTourStopsRef.current[newIndex].lat,
                              !isMobile
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
                      // w: "auto",
                      overflowY: "hidden",
                    },
                  }}
                  ref={tourStopsCardsContainerRef}
                >
                  {tour?.tourStops?.length > 0 &&
                    tour?.tourStops.map((tourStop: any) => (
                      <Box
                        key={`ts-${tourStop.number}`}
                        {...mobileCardWrapper}
                        pr="20px"
                        className="cardContainer"
                      >
                        <CardTourStop tourStop={tourStop} />
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
    // <MainContent
    //   isDrawer={isTablet || isDesktopAndUp}
    //   isVerticalContent={!isTablet && !isDesktopAndUp}
    //   layerStyle="blurredLightGray"
    // >
    //   <Grid w="100%" templateRows="1fr auto" templateColumns="100%" minH="100%">
    //     <Box>
    //       <Box px="20px" pt="0.5em">
    //         <Box mb="3">
    //           <Text className="tourStop" color="cm.text" fontWeight="bold">
    //             {t("tour.detail.title", "Tour")}
    //           </Text>
    //         </Box>

    //         <Box bg="#fff" borderRadius="lg" overflow="hidden">
    //           {tour?.heroImage && tour?.heroImage.id && (
    //             <Box>
    //               <AspectRatio w="100%" ratio={16 / 9}>
    //                 <Box bg={color} filter="li">
    //                   {tour?.heroImage && tour?.heroImage.id && (
    //                     <Box w="100%" h="100%">
    //                       <ApiImage
    //                         id={tour?.heroImage.id}
    //                         alt={tour?.heroImage.alt}
    //                         meta={tour?.heroImage.meta}
    //                         forceAspectRatioPB={66.66}
    //                         status={tour?.heroImage.status}
    //                         sizes="(min-width: 45rem) 600px, 100vw"
    //                         cropPosition={tour?.heroImage?.cropPosition}
    //                         objectFit="cover"
    //                       />
    //                     </Box>
    //                   )}
    //                 </Box>
    //               </AspectRatio>
    //               {tour?.heroImage.credits !== "" && (
    //                 <Text
    //                   textStyle="finePrint"
    //                   mt="0.5"
    //                   px={isMobile ? "20px" : "35px"}
    //                 >
    //                   <MultiLangValue json={tour?.heroImage.credits} />
    //                 </Text>
    //               )}
    //             </Box>
    //           )}

    //           <Box
    //             px={isMobile ? "20px" : "35px"}
    //             pt={isMobile ? "20px" : "35px"}
    //             pb={isMobile ? "20px" : "1em"}
    //             w={isMobile ? "100%" : "66.66%"}
    //           >
    //             {meta && (
    //               <Flex
    //                 textStyle="categoriesTourStop"
    //                 color={color}
    //                 alignItems="flex-end"
    //                 width="66.66%"
    //               >
    //                 {meta}
    //               </Flex>
    //             )}
    //             <chakra.h1
    //               mb="0.3em !important"
    //               textStyle="headline"
    //               sx={{
    //                 a: {
    //                   _hover: {
    //                     color: "#333 !important",
    //                   },
    //                 },
    //               }}
    //             >
    //               <MultiLangValue json={tour.title} />
    //             </chakra.h1>
    //           </Box>

    //           {!isEmptyHtml(getMultilangHtml(tour.teaser, true)) && (
    //             <Box
    //               px={{
    //                 base: "20px",
    //                 md: "35px",
    //               }}
    //               pb="2em"
    //               textStyle="larger"
    //             >
    //               <MultiLangHtml json={tour.teaser} addMissingTranslationInfo/>
    //             </Box>
    //           )}

    //           {!isEmptyHtml(getMultilangHtml(tour.description), true) && (
    //             <Box
    //               px={{
    //                 base: "20px",
    //                 md: "35px",
    //               }}
    //               pb="2em"
    //             >
    //               <MultiLangHtml json={tour.description} addMissingTranslationInfo/>
    //             </Box>
    //           )}
    //         </Box>

    //         <Box
    //           as="article"
    //           data-id={tour.id}
    //           bg="#fff"
    //           borderRadius="lg"
    //           overflow="hidden"
    //           w="100%"
    //           mt="20px"
    //           maxW={isMobile && !fillContainer ? "275px" : "100%"}
    //           h={isMobile && fillContainer ? "100%" : undefined}
    //           className="svgHover"
    //         >
    //           <Flex
    //             flexDirection={isMobile ? "column" : "row-reverse"}
    //             alignItems={isMobile ? "flex-end" : "flex-start"}
    //           >
    //             <Box
    //               w={isMobile ? "50%" : "33.33%"}
    //               pb={isMobile ? "0px" : "20px"}
    //             >
    //               <Box position="relative">
    //                 <AspectRatio w="100%" ratio={3 / 2}>
    //                   <Box bg={color}>
    //                     {tour?.heroImage && tour?.heroImage.id && (
    //                       <Box
    //                         w="100%"
    //                         h="100%"
    //                         sx={{
    //                           mixBlendMode: "screen",

    //                           "img, picture": {
    //                             filter: " grayscale(1)",
    //                           },
    //                         }}
    //                       >
    //                         <ApiImage
    //                           id={tour?.heroImage.id}
    //                           alt={tour?.heroImage.alt}
    //                           meta={tour?.heroImage.meta}
    //                           forceAspectRatioPB={66.66}
    //                           status={tour?.heroImage.status}
    //                           sizes="(min-width: 45rem) 700px, 100vw"
    //                           objectFit="cover"
    //                           cropPosition={tour?.heroImage?.cropPosition}
    //                         />
    //                       </Box>
    //                     )}
    //                   </Box>
    //                 </AspectRatio>
    //               </Box>
    //             </Box>
    //             <Box
    //               px={isMobile ? "20px" : "35px"}
    //               pt={isMobile ? "0" : "35px"}
    //               pb={isMobile ? "0px" : "20px"}
    //               w={isMobile ? "100%" : "66.66%"}
    //             >
    //               <Flex
    //                 textStyle="categoriesTourStop"
    //                 color={color}
    //                 h="35px"
    //                 alignItems="flex-end"
    //               ></Flex>
    //               <chakra.h2
    //                 mb="0.3em !important"
    //                 sx={{
    //                   a: {
    //                     _hover: {
    //                       color: "#333 !important",
    //                     },
    //                   },
    //                 }}
    //               >
    //                 {t("tour.detail.facts", "About the tour")}
    //               </chakra.h2>
    //             </Box>
    //           </Flex>

    //           <Box
    //             px={isMobile ? "20px" : "35px"}
    //             pb={isMobile ? "20px" : "35px"}
    //           >
    //             {tour?.tourStops?.length > 0 && (
    //               <Flex>
    //                 <Box
    //                   mb="0.5em"
    //                   color="cm.accentDark"
    //                   textTransform="uppercase"
    //                   textStyle="categories"
    //                   w="100px"
    //                   pt="0.2em"
    //                   mt="0.3em"
    //                 >
    //                   {t("tour.detail.label.start", "Start")}
    //                 </Box>
    //                 <Box textStyle="card">
    //                   <MultiLangValue json={tour?.tourStops[0].title} />
    //                 </Box>
    //               </Flex>
    //             )}
    //             {tour?.tourStops?.length > 1 && (
    //               <Flex>
    //                 <Box
    //                   mb="0.5em"
    //                   color="cm.accentDark"
    //                   textTransform="uppercase"
    //                   textStyle="categories"
    //                   w="100px"
    //                   pt="0.2em"
    //                   mt="0.3em"
    //                 >
    //                   {t("tour.detail.label.stop", "Stop")}
    //                 </Box>
    //                 <Box textStyle="card">
    //                   <MultiLangValue
    //                     json={tour?.tourStops[tour?.tourStops.length - 1].title}
    //                   />
    //                 </Box>
    //               </Flex>
    //             )}
    //             {tour?.distance && tour?.duration && (
    //               <Flex>
    //                 <Box
    //                   mb="0.5em"
    //                   color="cm.accentDark"
    //                   textTransform="uppercase"
    //                   textStyle="categories"
    //                   w="100px"
    //                   pt="0.2em"
    //                   mt="0.3em"
    //                 >
    //                   {t("tour.detail.label.distance", "Distance")}
    //                 </Box>
    //                 <Box textStyle="card">
    //                   <MultiLangValue json={tour?.distance} /> |{" "}
    //                   <MultiLangValue json={tour?.duration} />
    //                 </Box>
    //               </Flex>
    //             )}
    //           </Box>
    //         </Box>
    //       </Box>

    //     </Box>
    //     <Footer noBackground />
    //   </Grid>
    // </MainContent>
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
