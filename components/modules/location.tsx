import { useEffect } from "react";
import { gql } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  CardEvent,
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

const locationQuery = gql`
  query ($slug: String!) {
    location(slug: $slug) {
      id
      title
      slug
      description
      offers
      accessibilityInformation
      address
      contactInfo
      socialMedia
      lat
      lng
      agency
      primaryTerms {
        id
        name
        slug
      }
      terms {
        id
        name
        slug
        taxonomyId
      }
      events {
        id
        slug
        title
        description
        heroImage {
          id
          status
          meta
          credits
          alt
        }
        firstEventDate
        lastEventDate
        dates {
          begin
          end
          date
        }
      }
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
    }
  }
`;

export const ModuleComponentLocation = ({
  location,
  ...props
}: {
  location: any;
  props: any;
}) => {
  const cultureMap = useMapContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cultureMap && location?.lng && location?.lat) {
        cultureMap.clear();
        cultureMap.addMarkers([
          {
            type: "location",
            id: location.id,
            slug: location.slug,
            lng: location.lng,
            lat: location.lat,
          },
        ]);
        cultureMap.panTo(location.lng, location.lat);
      }
    }
  }, [location, cultureMap]);

  let meta: any;
  let color = config.colorDark;

  if (location?.primaryTerms?.length > 0) {
    meta = getMultilangValue(location?.primaryTerms[0]?.name);

    if (settings?.terms && location?.primaryTerms[0].id in settings?.terms) {
      color =
        settings?.terms[location?.primaryTerms[0].id].colorDark ??
        settings?.terms[location?.primaryTerms[0].id].color ??
        color;
    }
  } else if (location?.terms?.length > 0) {
    meta = getMultilangValue(location?.terms[0]?.name);
    if (settings?.terms && location?.terms[0].id in settings?.terms) {
      color =
        settings?.terms[location?.terms[0].id].colorDark ??
        settings?.terms[location?.terms[0].id].color ??
        color;
    }
  } else {
    meta = t("card.meta.location", "Location");
  }

  const taxonomies = location?.terms?.reduce((acc: any, term: any) => {
    if (settings?.terms[term.id]?.taxonomyId) {
      const tax = Object.keys(settings?.taxMapping).find(
        (key) => parseInt(settings?.taxMapping[key]) === term.taxonomyId
      );
      console.log(tax);

      if (!tax) return acc;

      if (!(tax in acc)) acc = { ...acc, [tax]: [] };

      acc[tax].push(term);
      return acc;
    }
  }, {});

  const address = `
    ${location?.address?.co ? `${location?.address?.co}<br/>` : ""}
    ${
      location?.address?.street1
        ? `${location?.address?.street1} ${
            location?.address?.houseNumber ?? ""
          } <br/>`
        : ""
    }
    ${location?.address?.street2 ? `${location?.address?.street2}<br/>` : ""}
    ${location?.address?.postCode ?? ""} ${location?.address?.city ?? ""}<br/>
  `;

  const contact = `
    ${
      location?.contactInfo?.phone1
        ? `${location?.contactInfo?.phone1}<br/>`
        : ""
    }
    ${
      location?.contactInfo?.phone2
        ? `${location?.contactInfo?.phone2}<br/>`
        : ""
    }
    ${
      location?.contactInfo?.email1
        ? `<a href="mailto:${location?.contactInfo?.email1}">${location?.contactInfo?.email1}</a><br/>`
        : ""
    }
    ${
      location?.contactInfo?.email2
        ? `<a href="mailto:${location?.contactInfo?.email2}">${location?.contactInfo?.email2}</a><br/>`
        : ""
    }
  `;

  const links = `
    ${location?.socialMedia?.website ? `<a href="${location?.socialMedia?.website}" rel="no-referral">${location?.socialMedia?.website}</a><br/>` : ""}   
    ${location?.socialMedia?.facebook ? `<a href="${location?.socialMedia?.facebook}" rel="no-referral">${location?.socialMedia?.facebook}</a><br/>` : ""}   
    ${location?.socialMedia?.instagram ? `<a href="${location?.socialMedia?.instagram}" rel="no-referral">${location?.socialMedia?.instagram}</a><br/>` : ""}   
    ${location?.socialMedia?.twitter ? `<a href="${location?.socialMedia?.twitter}" rel="no-referral">${location?.socialMedia?.twitter}</a><br/>` : ""}   
    ${location?.socialMedia?.youtube ? `<a href="${location?.socialMedia?.youtube}" rel="no-referral">${location?.socialMedia?.youtube}</a><br/>` : ""}   
  `;

  return (
    <Box layerStyle="blurredLightGray">
      <Box px="20px" pt="0.5em">
        <Box mb="3">
          <Text className="highlight" color="cm.text" fontWeight="bold">
            {t("location.detail.title", "Location")}
          </Text>
        </Box>

        <Box bg="#fff" borderRadius="lg" overflow="hidden">
          {location?.heroImage && location?.heroImage.id && (
            <AspectRatio w="100%" ratio={16 / 9}>
              <Box bg={color} filter="li">
                {location?.heroImage && location?.heroImage.id && (
                  <Box w="100%" h="100%">
                    <ApiImage
                      id={location?.heroImage.id}
                      alt={location?.heroImage.alt}
                      meta={location?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={location?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      cropPosition={location?.heroImage?.cropPosition}
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
              <MultiLangValue json={location.title} />
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
              <Box pb="1em" dangerouslySetInnerHTML={{ __html: address }} />
              <Box pb="1em" dangerouslySetInnerHTML={{ __html: contact }} />
              <Box pb="1em" dangerouslySetInnerHTML={{ __html: links }} />
            </Box>
          )}

          {!isEmptyHtml(getMultilangValue(location.description)) && (
            <Box
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="2em"
            >
              <MultiLangHtml json={location.description} />
            </Box>
          )}

          {!isEmptyHtml(getMultilangValue(location.offers)) && (
            <Box
              className="item"
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="1em"
            >
              <Box
                mb="0.5em"
                color="cm.accentDark"
                textTransform="uppercase"
                textStyle="categories"
              >
                {t("location.title.offers", "Offering the following")}:
              </Box>
              <Box textStyle="card">
                <MultiLangHtml json={location.offers} />
              </Box>
            </Box>
          )}

          {!isEmptyHtml(
            getMultilangValue(location.accessibilityInformation)
          ) && (
            <Box
              className="item"
              px={{
                base: "20px",
                md: "35px",
              }}
              pb="1em"
            >
              <Box
                mb="0.5em"
                color="cm.accentDark"
                textTransform="uppercase"
                textStyle="categories"
              >
                {t(
                  "location.title.accessibilityInformation",
                  "Accessibility Information"
                )}
                :
              </Box>
              <Box textStyle="card">
                <MultiLangHtml json={location.accessibilityInformation} />
              </Box>
            </Box>
          )}

          <SimpleGrid
            columns={2}
            spacingX="0.5em"
            spacingY="1em"
            px={{
              base: "20px",
              md: "35px",
            }}
            pb={{
              base: "20px",
              md: "35px",
            }}
          >
            {taxonomies["typeOfInstitution"]?.length > 0 && (
              <Box className="item">
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                >
                  {t("taxonomy.label.typeOfInstitution", "Type of Institution")}
                </Box>
                <Box textStyle="card">
                  {taxonomies["typeOfInstitution"]
                    .map((t: any) => {
                      if (!t) return "";

                      return getMultilangValue(t?.name);
                    })
                    .join(", ")}
                </Box>
              </Box>
            )}
            {taxonomies["targetAudience"]?.length > 0 && (
              <Box className="item">
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                >
                  {t("taxonomy.label.targetAudience", "Target Audience")}
                </Box>
                <Box textStyle="card">
                  {taxonomies["targetAudience"]
                    .map((t: any) => {
                      if (!t) return "";

                      return getMultilangValue(t?.name);
                    })
                    .join(", ")}
                </Box>
              </Box>
            )}
            {taxonomies["typeOfOrganisation"]?.length > 0 && (
              <Box className="item">
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                >
                  {t(
                    "taxonomy.label.typeOfOrganisation",
                    "Type of Organisation"
                  )}
                </Box>
                <Box textStyle="card">
                  {taxonomies["typeOfOrganisation"]
                    .map((t: any) => {
                      if (!t) return "";

                      return getMultilangValue(t?.name);
                    })
                    .join(", ")}
                </Box>
              </Box>
            )}

            {!isEmptyHtml(location.agency) && (
              <Box className="item">
                <Box
                  mb="0.5em"
                  color="cm.accentDark"
                  textTransform="uppercase"
                  textStyle="categories"
                >
                  {t("location.label.agency", "Agency")}
                </Box>
                <Box textStyle="card">{location.agency}</Box>
              </Box>
            )}
          </SimpleGrid>
        </Box>

        {location.events && location.events.length > 0 && (
          <Box mt="2em">
            <chakra.h3 className="highlight" color="cm.text" fontWeight="bold">
              {t("location.title.eventsHeldAt", "Events held at the location")}
            </chakra.h3>
            {location.events.map((event: any, i: number) => (
              <Box
                key={`evnt-${i}`}
                mt="4"
                _first={{
                  mt: 3,
                }}
              >
                <CardEvent event={event} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Footer noBackground />
    </Box>
  );
};

export const ModuleLocationGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

// This gets called on every request
export const ModuleLocationGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: locationQuery,
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

  if (!data?.location)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      location: data?.location,
    },
    revalidate: 3600,
  };
};
