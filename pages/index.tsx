import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Box, Heading } from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { getMultilangValue } from "~/utils";
import { MultiLangValue, MultiLangHtml, ApiImage, Card } from "~/components/ui";

import { useMapContext } from "~/provider";

const homepageQuery = gql`
  query {
    homepage {
      missionStatement
      missionStatementPage
      highlights
    }
  }
`;

export const Home = () => {
  const cultureMap = useMapContext();

  const [locations, setLocations] = useState([]);
  const { data, loading, error } = useQuery(homepageQuery);

  console.log(data);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     if (cultureMap && locations?.locations) {
  //       cultureMap.clear();
  //       cultureMap.addMarkers(
  //         locations?.locations.map((location: any) => ({
  //           type: "location",
  //           id: location.id,
  //           slug: location.slug,
  //           lng: location.lng,
  //           lat: location.lat,
  //         }))
  //       );
  //     }
  //   }
  // }, [locations, cultureMap]);

  return (
    <>
      <Box layerStyle="pageContainerWhite">
        {data?.homepage?.missionStatement && (
          <Box maxW="800px">
            <b>
              <MultiLangHtml json={data?.homepage?.missionStatement} />
            </b>

            {data?.homepage?.missionStatementPage?.slug && (
              <Link
                href={`/page/${getMultilangValue(
                  data?.homepage?.missionStatementPage?.slug
                )}/`}
              >
                Link to page
              </Link>
            )}
          </Box>
        )}
      </Box>
      {data?.homepage?.highlights?.length > 0 && (
        <Box w="270px">
          {data?.homepage?.highlights.map((h: any) => (
            <Card key={`h-${h.id}`} item={h} />
          ))}
        </Box>
      )}

      <Box textStyle="navigation">

        Lorem Lipsum Is det allet?
      </Box>
      <Box textStyle="larger">

        Lorem Lipsum Is det allet?
      </Box>
      <Box textStyle="categories">

        Lorem Lipsum Is det allet?
      </Box>
      <Box textStyle="finePrint">

        Lorem Lipsum Is det allet?
      </Box>
    </>
  );
};

// This gets called on every request
export async function getStaticProps(context: GetStaticProps) {
  return {
    props: {
      ...(await serverSideTranslations((context as any)?.locale)),
    },
  };
}

export default Home;
