import { useEffect } from "react";
import { gql } from "@apollo/client";
import { CardTour } from "~/components/ui/CardTour";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { getApolloClient } from "~/services";
import { Box, Grid, chakra } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { PageTitle } from "~/components/ui/PageTitle";
import { useRouter } from "next/router";
import { useConfigContext, useMapContext } from "~/provider";
import { getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { settingsQueryPartial } from "~/graphql";

const toursQuery = gql`
  query tours($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    ${settingsQueryPartial}
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
  const { t, i18n } = useAppTranslations();
  const router = useRouter();
  const cultureMap = useMapContext();
  const config = useConfigContext();

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  return (
    <MainContent layerStyle="lightGray">
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en/tours" : "/touren"
        }`}
        title={`${t("tour.listings.title", "Tours")} - ${getSeoAppTitle(t)}`}
      />
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
          <PageTitle
            h1
            title={t("tour.listings.title", "Tours")}
            type="short"
          />

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
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 3600,
  };
};
