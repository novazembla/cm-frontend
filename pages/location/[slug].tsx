import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, chakra, Heading, Text } from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "../../utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import i18n from "i18next";
import { useEffect } from "react";
import { useMapContext } from "~/provider";
import { GetStaticPaths, GetStaticProps } from "next";

const Page = ({ location }: { location: any }) => {
  const cultureMap = useMapContext();

  const { t } = useTranslation();
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

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3" fontSize="2xl">
        <MultiLangValue json={location.title} />
      </Heading>
      <Box maxW="800px" size="lg" color="gray.600" fontWeight="bold" mb="3">
        <MultiLangHtml json={location.description} />
      </Box>

      {location.heroImage && location.heroImage.id && (
        <Box w="100%" maxW="800px" mb="3">
          <ApiImage
            id={location.heroImage.id}
            alt={location.heroImage.alt}
            meta={location.heroImage.meta}
            forceAspectRatioPB={75}
            status={location.heroImage.status}
            sizes="(min-widht: 55rem) 800px, 100vw"
          />
          {location.heroImage.credits !== "" && (
            <Text fontSize="xs" mt="0.5" color="gray.400">
              <MultiLangValue json={location.heroImage.credits} />
            </Text>
          )}
        </Box>
      )}

      {!isEmptyHtml(getMultilangValue(location.address)) && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("location.title.address", "Address")}:
          </Heading>
          <MultiLangHtml json={location.address} />
        </Box>
      )}

      {!isEmptyHtml(getMultilangValue(location.contactInfo)) && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("location.title.contactInfo", "Contact information")}:
          </Heading>
          <MultiLangHtml json={location.contactInfo} />
        </Box>
      )}

      {!isEmptyHtml(getMultilangValue(location.offers)) && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("location.title.offers", "Offering the following")}:
          </Heading>
          <MultiLangHtml json={location.offers} />
        </Box>
      )}

      {location.terms && location.terms.length > 0 && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("location.title.categories", "Categories")}:
          </Heading>

          {location.terms
            .map((term: any, i: number) => getMultilangValue(term.name))
            .join(", ")}
        </Box>
      )}

      {location.events && location.events.length > 0 && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("location.title.events", "Events")}:
          </Heading>

          {location.events.map((event: any, i: number) => (
            <Box
              key={`evnt-${i}`}
              mt="4"
              _first={{
                mt: 3,
              }}
            >
              <Link href={`/event/${getMultilangValue(event.slug)}`}>
                <a>
                  <chakra.span
                    display="block"
                    pl="2"
                    borderLeft="4px solid"
                    borderColor="orange.200"
                  >
                    <Heading as="h3" fontSize="md">
                      <MultiLangValue json={event.title} />
                    </Heading>
                    <Box fontSize="sm">
                      {event.dates &&
                        event.dates.length > 0 &&
                        event.dates
                          .map(
                            (date: any, i: number) =>
                              `${new Date(date.date).toLocaleDateString(
                                i18n.language,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )} ${new Date(date.begin).toLocaleTimeString(
                                i18n.language,
                                { hour: "2-digit", minute: "2-digit" }
                              )}-${new Date(date.end).toLocaleTimeString(
                                i18n.language,
                                { hour: "2-digit", minute: "2-digit" }
                              )}`
                          )
                          .join(", ")}
                    </Box>
                  </chakra.span>
                </a>
              </Link>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const locationQuery = gql`
    query ($slug: String!) {
      location(slug: $slug) {
        id
        title
        slug
        description
        address
        contactInfo
        offers
        lat
        lng
        terms {
          id
          name
          slug
        }
        events {
          id
          slug
          title
          dates {
            begin
            end
            date
          }
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

  const accessToken = (context?.previewData as any)?.accessToken

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
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      ...(await serverSideTranslations((context as any)?.locale)),
      location: data?.location,
    },
    revalidate: 240,
  };

}

export default Page;
