import { GetStaticProps } from "next";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Box, Flex, chakra } from "@chakra-ui/react";
import { gql, useQuery } from "@apollo/client";
import { getMultilangValue } from "~/utils";
import {
  MultiLangHtml,
  CardTour,
  CardLocation,
  CardEvent,
} from "~/components/ui";

import { useIsBreakPoint } from "~/hooks";

import { useMapContext } from "~/provider";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation();

  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const [locations, setLocations] = useState([]);
  const { data, loading, error } = useQuery(homepageQuery);

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
      <AnimatePresence>
        {!loading && data?.homepage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box>
              <Box
                layerStyle="pageContainerWhite"
                borderBottom="1px solid"
                borderColor="cm.accentDark"
              >
                {data?.homepage?.missionStatement && (
                  <Box>
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
                <Box
                  layerStyle="blurredLightGray"
                  overflow="hidden"
                  position={isMobile ? "fixed" : "static"}
                  bottom="100px"
                  px="20px"
                  sx={{
                    article: {
                      mb: !isMobile ? "20px" : "0",
                      mr: !isMobile ? "0" : "20px",
                    },
                  }}
                  w="100%"
                >
                  <chakra.h3 className="highlight" color="cm.text" mt="0.5em">
                    {t("homepage.title.highlights", "Highlights")}
                  </chakra.h3>

                  <Box overflowY={isMobile ? "auto" : "hidden"} w="100%">
                    <Flex
                      flexDirection={isMobile ? "row" : "column"}
                      w={isMobile ? "2000px" : "100%"}
                      sx={{
                        "@media (max-width: 44.9999em)": {
                          flexDirection: "row",
                          w: "2000px",
                          overflowY: "auto",
                        },
                        "@media (min-width: 45em)": {
                          flexDirection: "column",
                          w: "auto",
                          overflowY: "hidden",
                        },
                      }}
                    >
                      {data?.homepage?.highlights.map((h: any) => {
                        if (h.type === "location") {
                          return (
                            <CardLocation key={`h-${h.id}`} location={h} />
                          );
                        } else if (h.type === "event") {
                          return <CardEvent key={`h-${h.id}`} event={h} />;
                        } else if (h.type === "tour") {
                          return <CardTour key={`h-${h.id}`} tour={h} />;
                        } else {
                          return <></>;
                        }
                      })}
                    </Flex>
                  </Box>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};

export default Home;
