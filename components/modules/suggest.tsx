import { Footer } from "~/components/app";
import { Box, Heading } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";

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
  const { t, i18n } = useTranslation();
  return (
    <>
      <Box layerStyle="page">
        <Box layerStyle="headingPullOut" mb="3">
          <Heading as="h1" className="highlight" color="cm.text">
            {t("suggest.title", "Suggest location")}
          </Heading>
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
            Formular, .... Suggest location / Kartenpunkt Vorschlagen
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};
