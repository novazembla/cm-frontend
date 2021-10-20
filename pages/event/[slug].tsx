import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, chakra, Heading, Text } from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "../../utils";
import { useTranslation } from "next-i18next";
import { ListLocation } from "~/components/ui";
import { GetStaticPaths, GetStaticProps } from "next";

const Page = ({ event }: { event: any }) => {
  const { t } = useTranslation();

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3" fontSize="2xl">
        <MultiLangValue json={event.title} />
      </Heading>
      <Box maxW="800px" size="lg" color="gray.600" fontWeight="bold" mb="3">
        <MultiLangHtml json={event.description} />
      </Box>
      {event.heroImage && event.heroImage.id && (
        <Box w="100%" maxW="800px" mb="3">
          <ApiImage
            id={event.heroImage.id}
            alt={event.heroImage.alt}
            meta={event.heroImage.meta}
            forceAspectRatioPB={75}
            status={event.heroImage.status}
            sizes="(min-widht: 55rem) 800px, 100vw"
          />
          {event.heroImage.credits !== "" && (
            <Text fontSize="xs" mt="0.5" color="gray.400">
              <MultiLangValue json={event.heroImage.credits} />
            </Text>
          )}
        </Box>
      )}

      {event.terms && event.terms.length > 0 && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("event.title.categories", "Categories")}:
          </Heading>

          {event.terms
            .map((term: any, i: number) => getMultilangValue(term.name))
            .join(", ")}
        </Box>
      )}

      {event.locations && event.locations.length > 0 && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("event.title.locations", "Locations")}:
          </Heading>

          {event.locations.map((location: any, i: number) => (
            <ListLocation key={`log-${i}`} location={location} />
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

  const eventQuery = gql`
    query ($slug: String!) {
      event(slug: $slug) {
        id
        title
        slug
        description
        terms {
          id
          name
          slug
        }
        locations {
          id
          title
          slug
          description
          lat
          lng
        }
        dates {
          begin
          end
          date
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

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: eventQuery,
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

  if (!data?.event)
    return {
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      ...(await serverSideTranslations((context as any)?.locale)),
      event: data?.event,
    },
    revalidate: 240,
  };
};

export default Page;
