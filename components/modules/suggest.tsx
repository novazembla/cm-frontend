import { Footer } from "~/components/app";
import { Box, chakra, Grid } from "@chakra-ui/react";
import { MainContent } from "~/components/app";
import { useAppTranslations } from "~/hooks";

// const eventQuery = gql`
//   query ($slug: String!) {
//     event(slug: $slug) {
//       id
//       title
//       slug
//       address
//       organiser
//       meta
//       isFree
//       description
//       firstEventDate
//       lastEventDate
//       terms {
//         id
//         name
//         slug
//       }
//       locations {
//         id
//         title
//         slug
//         description
//         lat
//         lng
//         heroImage {
//           id
//           status
//           meta
//           alt
//           credits
//         }
//         terms {
//           id
//           name
//           slug
//         }
//         primaryTerms {
//           id
//           name
//           slug
//         }
//       }
//       dates {
//         begin
//         end
//         date
//       }
//       heroImage {
//         id
//         status
//         meta
//         alt
//         credits
//       }
//     }
//   }
// `;

export const ModuleComponentSuggest = () => {
  const { t } = useAppTranslations();
  return (
    <MainContent isDrawer layerStyle="pageBg">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)"
        }}
      >
        <Box layerStyle="page">
          <Box layerStyle="headingPullOut" mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              {t("suggest.title", "Suggest location")}
            </chakra.h1>
          </Box>

          <Box color="cm.text">
            <Box
              p="10"
              size="lg"
              color="gray.600"
              fontWeight="bold"
              border="2px solid red"
              mb="1em"
              h="200"
            >
              Formular, .... Suggest location / Kartenpunkt Vorschlagen ...
            </Box>
          </Box>
        </Box>
        <Footer />
      </Grid>
    </MainContent>
  );
};
