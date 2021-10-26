import { useEffect } from "react";
import { gql } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  CardTourStop,
} from "~/components/ui";
import { Footer } from "~/components/app";
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
  Text,
  chakra,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { getMultilangValue, isEmptyHtml } from "~/utils";
import { useIsBreakPoint } from "~/hooks";
import { useTranslation } from "next-i18next";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";

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
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cultureMap && tour?.lng && tour?.lat) {
        cultureMap.clear();
        cultureMap.addMarkers([
          {
            type: "tour",
            id: tour.id,
            slug: tour.slug,
            lng: tour.lng,
            lat: tour.lat,
          },
        ]);
        cultureMap.panTo(tour.lng, tour.lat);
      }
    }
  }, [tour, cultureMap]);

  let meta: any = t("card.meta.tour", "Tour");
  let color = config.colorDark;

  const address = `
    ${tour?.address?.co ? `${tour?.address?.co}<br/>` : ""}
    ${
      tour?.address?.street1
        ? `${tour?.address?.street1} ${tour?.address?.houseNumber ?? ""} <br/>`
        : ""
    }
    ${tour?.address?.street2 ? `${tour?.address?.street2}<br/>` : ""}
    ${tour?.address?.postCode ?? ""} ${tour?.address?.city ?? ""}<br/>
  `.trim();

  const contact = `
    ${tour?.contactInfo?.phone1 ? `${tour?.contactInfo?.phone1}<br/>` : ""}
    ${tour?.contactInfo?.phone2 ? `${tour?.contactInfo?.phone2}<br/>` : ""}
    ${
      tour?.contactInfo?.email1
        ? `<a href="mailto:${tour?.contactInfo?.email1}">${tour?.contactInfo?.email1}</a><br/>`
        : ""
    }
    ${
      tour?.contactInfo?.email2
        ? `<a href="mailto:${tour?.contactInfo?.email2}">${tour?.contactInfo?.email2}</a><br/>`
        : ""
    }
  `.trim();

  const links = `
    ${
      tour?.socialMedia?.website
        ? `<a href="${tour?.socialMedia?.website}" rel="no-referral">${tour?.socialMedia?.website}</a><br/>`
        : ""
    }   
    ${
      tour?.socialMedia?.facebook
        ? `<a href="${tour?.socialMedia?.facebook}" rel="no-referral">${tour?.socialMedia?.facebook}</a><br/>`
        : ""
    }   
    ${
      tour?.socialMedia?.instagram
        ? `<a href="${tour?.socialMedia?.instagram}" rel="no-referral">${tour?.socialMedia?.instagram}</a><br/>`
        : ""
    }   
    ${
      tour?.socialMedia?.twitter
        ? `<a href="${tour?.socialMedia?.twitter}" rel="no-referral">${tour?.socialMedia?.twitter}</a><br/>`
        : ""
    }   
    ${
      tour?.socialMedia?.youtube
        ? `<a href="${tour?.socialMedia?.youtube}" rel="no-referral">${tour?.socialMedia?.youtube}</a><br/>`
        : ""
    }   
  `;

  return (
    <Box layerStyle="blurredLightGray">
      <Box px="20px" pt="0.5em">
        <Box mb="3">
          <Text className="highlight" color="cm.text" fontWeight="bold">
            {t("tour.detail.title", "Tour")}
          </Text>
        </Box>

        <Box bg="#fff" borderRadius="lg" overflow="hidden">
          {tour?.heroImage && tour?.heroImage.id && (
            <AspectRatio w="100%" ratio={16 / 9}>
              <Box bg={color} filter="li">
                {tour?.heroImage && tour?.heroImage.id && (
                  <Box w="100%" h="100%">
                    <ApiImage
                      id={tour?.heroImage.id}
                      alt={tour?.heroImage.alt}
                      meta={tour?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={tour?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      cropPosition={tour?.heroImage?.cropPosition}
                    />
                  </Box>
                )}
              </Box>
            </AspectRatio>
          )}

          <Box
            px={isMobile ? "20px" : "35px"}
            pt={isMobile ? "20px" : "35px"}
            pb={isMobile ? "20px" : "1em"}
            w={isMobile ? "100%" : "66%"}
          >
            {meta && (
              <Flex
                textStyle="categoriesHighlight"
                color={color}
                alignItems="flex-end"
                width="66.66%"
              >
                {meta}
              </Flex>
            )}
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
            >
              <MultiLangValue json={tour.title} />
            </chakra.h1>
          </Box>

          {(!isEmptyHtml(address) ||
            !isEmptyHtml(contact) ||
            !isEmptyHtml(links)) && (
            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="1em"
            >
              {!isEmptyHtml(address) && (
                <Box pb="1em" dangerouslySetInnerHTML={{ __html: address }} />
              )}
              {!isEmptyHtml(contact) && (
                <Box pb="1em" dangerouslySetInnerHTML={{ __html: contact }} />
              )}
              {!isEmptyHtml(links) && (
                <Box pb="1em" dangerouslySetInnerHTML={{ __html: links }} />
              )}
            </Box>
          )}

          {!isEmptyHtml(getMultilangValue(tour.teaser)) && (
            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="2em"
              textStyle="larger"
            >
              <MultiLangHtml json={tour.teaser} />
            </Box>
          )}

          {!isEmptyHtml(getMultilangValue(tour.description)) && (
            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="2em"
            >
              <MultiLangHtml json={tour.description} />
            </Box>
          )}
        </Box>

        <Box
          bg="#fff"
          borderRadius="lg"
          overflow="hidden"
          w={isMobile ? "80%" : "100%"}
          maxW={isMobile ? "275px" : "100%"}
          mt="20px"
        >
          <Flex
            flexDirection={isMobile ? "column" : "row-reverse"}
            alignItems={isMobile ? "flex-end" : "flex-start"}
          >
            <Box w={isMobile ? "50%" : "33.33%"} pb={isMobile ? "0px" : "20px"}>
              <Box position="relative">
                <AspectRatio w="100%" ratio={3 / 2}>
                  <Box bg={color}>
                    {tour?.heroImage && tour?.heroImage.id && (
                      <Box
                        w="100%"
                        h="100%"
                        sx={{
                          mixBlendMode: "multiply",

                          "img, picture": {
                            filter: "grayscale()",
                          },
                        }}
                      >
                        <ApiImage
                          id={tour?.heroImage.id}
                          alt={tour?.heroImage.alt}
                          meta={tour?.heroImage.meta}
                          forceAspectRatioPB={66.66}
                          status={tour?.heroImage.status}
                          sizes="(min-width: 45rem) 400px, 40vw"
                          cropPosition={tour?.heroImage?.cropPosition}
                        />
                      </Box>
                    )}
                  </Box>
                </AspectRatio>
              </Box>
            </Box>
            <Box
              px={isMobile ? "20px" : "35px"}
              pt={isMobile ? "0" : "35px"}
              pb={isMobile ? "0px" : "20px"}
              w={isMobile ? "100%" : "66%"}
            >
              <Flex
                textStyle="categoriesHighlight"
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

          <Box px={isMobile ? "20px" : "35px"} pb={isMobile ? "20px" : "35px"}>
            {tour?.tourStops?.length > 0 && (
              <Flex>
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                  w="100px"
                  pt="0.2em"
                  mt="0.3em"
                >
                  {t("tour.detail.label.start", "Start")}
                </Box>
                <Box textStyle="card">
                  <MultiLangValue json={tour?.tourStops[0].title} />
                </Box>
              </Flex>
            )}
            {tour?.tourStops?.length > 1 && (
              <Flex>
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                  w="100px"
                  pt="0.2em"
                  mt="0.3em"
                >
                  {t("tour.detail.label.start", "Stop")}
                </Box>
                <Box textStyle="card">
                  <MultiLangValue
                    json={tour?.tourStops[tour?.tourStops.length - 1].title}
                  />
                </Box>
              </Flex>
            )}
            {tour?.distance && tour?.duration && (
              <Flex>
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                  w="100px"
                  pt="0.2em"
                  mt="0.3em"
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
          <Box key={`ts-${tourStop.number}`} px="20px" pt="20px">
            <CardTourStop tourStop={tourStop} />
          </Box>
        ))}
      <Footer noBackground />
    </Box>
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
