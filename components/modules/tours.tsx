import { useState, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  MultiLangValue,
  MultiLangHtml,
  CardTour,
  LoadingIcon,
  ErrorMessage,
} from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import { Box, chakra, Grid, Text, Button } from "@chakra-ui/react";
import { isEmptyHtml } from "~/utils";

import { GetStaticProps, GetStaticPropsContext } from "next";
import { useAppTranslations } from "~/hooks";

const toursQuery = gql`
  query tours($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    tours(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      tours {
        id
        title
        slug
        teaser
        status
        orderNumber
        tourStopCount
        tourStops {
          id
          title
          number
        }
        heroImage {
          id
          status
          meta
          alt
          credits
          cropPosition
        }
      }
      totalCount
    }
  }
`;

const initialQueryState = {
  where: {},
  orderBy: [
    {
      orderNumber: "asc",
    },
  ],
  pageSize: 50,
  pageIndex: 0,
};

export const ModuleComponentTours = ({ ...props }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { t } = useAppTranslations();

  const { data, loading, error, fetchMore } = useQuery(toursQuery, {
    notifyOnNetworkStatusChange: true,
    variables: initialQueryState,
  });

  const showLoadMore =
    data?.tours?.totalCount >
    initialQueryState?.pageSize +
      initialQueryState?.pageSize * currentPageIndex;

  return (
    <MainContent layerStyle="lightGray">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)"
        }}
      >
        <Box px="20px" pt="0.5em">
          <Box mb="3">
            <Text className="highlight" color="cm.text" fontWeight="bold">
              {t("tour.listings.title", "Tours")}
            </Text>
          </Box>

          <Box>
            {error && <ErrorMessage type="dataLoad" />}
            {data?.tours?.tours?.length &&
              data?.tours?.tours.map((tour: any) => (
                <Box key={`tour-${tour.id}`} pb="20px">
                  <CardTour tour={tour} />
                </Box>
              ))}

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
                          tours: {
                            totalCount: fetchMoreResult.tours?.totalCount,
                            tours: [
                              ...prev?.tours?.tours,
                              ...fetchMoreResult.tours?.tours,
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
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};
