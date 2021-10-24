import { useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { Box, Heading } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { getApolloClient } from "~/services";

import { useMapContext } from "~/provider";

export const Locations = ({ locations }: { locations: any }) => {
  const cultureMap = useMapContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cultureMap && locations?.locations) {
        cultureMap.clear();
        cultureMap.addMarkers(
          locations?.locations.map((location: any) => ({
            type: "location",
            id: location.id,
            slug: location.slug,
            lng: location.lng,
            lat: location.lat,
          }))
        );
      }
    }
  }, [locations, cultureMap]);

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3">
      ???
      </Heading>
      <Box maxW="800px">
        Proin tincidunt enim in felis aliquet, a ultricies purus bibendum.
      </Box>
    </Box>
  );
};

// This gets called on every request
// export async function getServerSideProps({
//   params,
//   locale,
// }: {
//   params: any;
//   locale: any;
// }) {
//   const client = getApolloClient();

//   const locationsQuery = gql`
//     query {
//       locations(pageSize: 50) {
//         totalCount
//         locations {
//           id
//           title
//           slug
//           description
//           lat
//           lng
//         }
//       }
//     }
//   `;

//   const { data } = await client.query({
//     query: locationsQuery,
//     variables: {},
//   });

//   return {
//     props: {
//       ...(await serverSideTranslations(locale)),
//       locations: data.locations,
//     },
//   };
// }

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
}

export default Locations;
