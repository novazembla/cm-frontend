import { useEffect } from "react";
import {
  MultiLangValue,
  MultiLangHtml,
  ApiImage,
  CardEvent,
} from "~/components/ui";
import { Footer } from "~/components/app";
import { getApolloClient } from "~/services";
import {
  useMapContext,
  useConfigContext,
  useSettingsContext,
} from "~/provider";
import {
  Box,
  Flex,
  AspectRatio,
  Text,
  chakra,
  SimpleGrid,
} from "@chakra-ui/react";
import { getMultilangValue, isEmptyHtml } from "~/utils";
import { useIsBreakPoint } from "~/hooks";
import { useTranslation } from "next-i18next";
import { GetStaticPaths, GetStaticProps } from "next";

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

export const ModuleComponentMap = () => {
  const cultureMap = useMapContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();
  const config = useConfigContext();
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (cultureMap) {
        cultureMap.showCluster();
      }
    }
  }, [cultureMap]);

  return (
    <>
      <Box layerStyle="page">
        <Box layerStyle="headingPullOut" mb="3">
          <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
            {t("map.title", "Map")}
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
            Kartenansicht (alle katenpunkte)
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};
