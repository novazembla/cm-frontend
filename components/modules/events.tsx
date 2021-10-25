import { useState, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  Event,
  LoadingIcon,
  ErrorMessage,
} from "~/components/ui";
import { Footer } from "~/components/app";
import { getApolloClient } from "~/services";
import { Box, chakra, Heading, Flex, Button } from "@chakra-ui/react";
import { isEmptyHtml, getMultilangValue } from "~/utils";
import { useTranslation } from "next-i18next";

import { GetStaticProps, GetStaticPropsContext } from "next";

// @ts-ignore
import VirtualScroller from "virtual-scroller/react";

const eventsQuery = gql`
  query events($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    events(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalCount
      events {
        id
        title
        slug
        firstEventDate
        lastEventDate
        address
        terms {
          id
          taxonomyId
          name
        }
        dates {
          date
          begin
          end
        }
      }
    }
  }
`;

const initialQueryState = {
  where: {},
  orderBy: [
    {
      firstEventDate: "asc",
    },
  ],
  pageSize: 50,
  pageIndex: 0,
};

export const ModuleComponentEvents = ({ ...props }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { t, i18n } = useTranslation();

  const { data, loading, error, fetchMore } = useQuery(eventsQuery, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...initialQueryState,
      orderBy: [
        {
          firstEventDate: "asc",
        },
        {
          [`title_${i18n.language}`]: "asc",
        },
      ],
    },
  });

  const showLoadMore =
    data?.events?.totalCount >
    initialQueryState?.pageSize +
      initialQueryState?.pageSize * currentPageIndex;

  return (
    <Box w="100%">
      <Box layerStyle="page">
        <Box layerStyle="headingPullOut" mb="3">
          <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
            {t("page.title", "Events")}
          </chakra.h1>
        </Box>
        <Box
          p="10"
          size="lg"
          color="gray.600"
          fontWeight="bold"
          border="2px solid red"
          mb="1em"
        >
          Form Filter
          <Heading as="h2" mb="3" fontSize="lg">
            {data?.events?.totalCount} {t("page.eventcount", "Events")}
          </Heading>
        </Box>
        <Box>
          {error && <ErrorMessage type="dataLoad" />}

          {data?.events?.events?.length && (
            <Box size="md" mt="3">
              {data?.events?.events.map((event: any) => (
                <Event key={`event-${event.id}`} event={event} />
              ))}
              {/* <VirtualScroller
                scrollableContainer={scrollContainerRef.current}
                items={data?.events?.events}
                itemComponent={Event}
              /> */}
            </Box>
          )}

          {showLoadMore && !loading && !error && (
            <Box>
              <Button
                onClick={() => {
                  const nextPageIndex = currentPageIndex + 1;
                  fetchMore({
                    variables: {
                      pageIndex: nextPageIndex,
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) return prev;
                      return {
                        ...prev,
                        events: {
                          totalCount: fetchMoreResult.events?.totalCount,
                          events: [
                            ...prev?.events?.events,
                            ...fetchMoreResult.events?.events,
                          ],
                        },
                      };
                    },
                  });
                  setCurrentPageIndex(nextPageIndex);
                }}
                color="white"
                variant="solid"
                colorScheme="red"
              >
                Load more (DESIGN)
              </Button>
            </Box>
          )}
          {loading && <LoadingIcon />}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};
