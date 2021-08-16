import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, chakra, Heading } from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "../utils";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import i18n from "i18next";

const Events = ({ events }: { events: any }) => {
  const { t } = useTranslation();

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3" fontSize="2xl">
        {t("page.title", "Events")}
      </Heading>

      <Box maxW="800px" size="lg" color="gray.600" fontWeight="bold">
        In sem urna, aliquam vel consectetur sit amet, pulvinar sit amet lectus. Quisque molestie dapibus libero non pellentesque. Vivamus quam arcu, dictum quis hendrerit eget, lobortis eu felis.
      </Box>

      {events.events && events.events.length && (
        <Box
          maxW="800px"
          size="md"
          mt="3"
          borderTop="1px solid"
          borderColor="gray.200"
          pt="3"
        >
          <Heading as="h2" mb="3" fontSize="lg">
        {events.totalCount} {t("page.eventcount", "Events")}
      </Heading>

          {events.events.map((event: any, i: number) => (
            <Box
              key={`evnt-${i}`}
              mt="4"
              _first={{
                mt:3
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
                              { year: "numeric", month: "long", day: "numeric" }
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

// This gets called on every request
export async function getServerSideProps({
  params,
  locale,
}: {
  params: any;
  locale: any;
}) {
  const client = getApolloClient();

  const eventsQuery = gql`
    query {
      events {
        totalCount
        events {
          id
          title
          slug
          description
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
    }
  `;

  const { data } = await client.query({
    query: eventsQuery,
    variables: {
      
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(locale)),
      events: data.events,
    },
  };
}

export default Events;
