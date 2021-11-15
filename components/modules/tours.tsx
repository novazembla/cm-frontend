import { useEffect } from "react";
import { gql } from "@apollo/client";
import { CardTour } from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import { Box, Grid, Text } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { useAppTranslations } from "~/hooks";
import { useRouter } from "next/router";
import { useMapContext } from "~/provider";

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
  pageSize: 100,
  pageIndex: 0,
};

export const ModuleComponentTours = ({
  tours,
  totalCount,
  ...props
}: {
  tours: any;
  totalCount: number;
  props: any;
}) => {
  const { t } = useAppTranslations();
  const router = useRouter();
  const cultureMap = useMapContext();

  useEffect(() => {
    console.log("mount events");

    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  return (
    <MainContent layerStyle="lightGray">
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
          <Box mb="3">
            <Text className="highlight" color="cm.text" fontWeight="bold">
              {t("tour.listings.title", "Tours")}
            </Text>
          </Box>

          <Box>
            {totalCount > 0 &&
              tours.map((tour: any) => (
                <Box key={`tour-${tour.id}`} pb="20px">
                  <CardTour tour={tour} />
                </Box>
              ))}
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};

// This gets called on every request
export const ModuleToursGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const { data } = await client.query({
    query: toursQuery,
    variables: initialQueryState,
  });

  if (!data?.tours)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      tours: data?.tours?.tours,
      totalCount: data?.tours?.totalCount,
    },
    revalidate: 3600,
  };
};
