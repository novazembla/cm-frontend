import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, chakra, Heading } from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "../../utils";
import { useTranslation } from "next-i18next";
import { ListLocation } from "~/components/ui";

const Page = ({ event }: { event: any }) => {
  const { t } = useTranslation();

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3" fontSize="2xl">
        <MultiLangValue json={event.title} />
      </Heading>
      <Box maxW="800px" size="lg" color="gray.600" fontWeight="bold">
        <MultiLangHtml json={event.description} />
      </Box>

      {!isEmptyHtml(getMultilangValue(event.descriptionLocation)) && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="4"
        >
          <Heading as="h2" mb="1" fontSize="md">
            {t("event.title.descriptionLocation", "Location information")}:
          </Heading>
          <MultiLangHtml json={event.descriptionLocation} />
        </Box>
      )}

      {event.terms && event.terms.length && (
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

      {event.locations && event.locations.length && (
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

// This gets called on every request
export async function getServerSideProps({
  params,
  locale,
}: {
  params: any;
  locale: any;
}) {
  const client = getApolloClient();

  const eventQuery = gql`
    query ($slug: String!) {
      event(slug: $slug) {
        id
        title
        slug
        description
        descriptionLocation
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
      }
    }
  `;

  const { data } = await client.query({
    query: eventQuery,
    variables: {
      slug: params.slug,
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(locale)),
      event: data.event,
    },
  };
}

export default Page;
