import { useEffect } from "react";
import { gql } from "@apollo/client";
import { ApiImage } from "~/components/ui/ApiImage";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { MultiLangHtml } from "~/components/ui/MultiLangHtml";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { getApolloClient } from "~/services";
import { Box, Text, chakra, Grid } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useConfigContext, useMapContext } from "~/provider";
import { useRouter } from "next/router";
import { getSeoAppTitle, getSeoImage } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { PageTitle } from "~/components/ui/PageTitle";
import { settingsQueryPartial } from "~/graphql";

const pageQuery = gql`
  query ($slug: String!) {
    ${settingsQueryPartial}
    page(slug: $slug) {
      id
      title
      slug
      intro
      content
      heroImage {
        id
        status
        meta
        alt
        credits
        cropPosition
      }
    }
  }
`;

export const ModuleComponentPage = ({ page }: { page: any }) => {
  const router = useRouter();
  const cultureMap = useMapContext();
  const config = useConfigContext();
  const { getMultilangValue, i18n, t } = useAppTranslations();
  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  return (
    <MainContent isDrawer>
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en" : ""
        }/${getMultilangValue(page?.slug)}`}
        title={`${getMultilangValue(page?.title)} - ${getSeoAppTitle(t)}`}
        description={getMultilangValue(page?.teaser)}
        og={{
          image: getSeoImage(page?.heroImage),
        }}
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
        <Box layerStyle="pageBg">
          <Box layerStyle="page">
            <PageTitle h1 type="high" title={getMultilangValue(page.title)} />

            <Box color="cm.text" w="100%">
              {page.heroImage && page.heroImage.id && (
                <Box w="100%" mt="1em" mb="3em" position="relative">
                  <Box bg="#333">
                    <ApiImage
                      id={page.heroImage.id}
                      useImageAspectRatioPB
                      alt={getMultilangValue(page?.heroImage.alt)}
                      meta={page.heroImage.meta}
                      status={page.heroImage.status}
                      sizes="(min-width: 45rem) 700px, 100vw"
                    />
                  </Box>
                  {page.heroImage.credits && (
                    <Text fontSize="xs" mt="0.5" color="cm.text">
                      <MultiLangValue json={page.heroImage.credits} />
                    </Text>
                  )}
                </Box>
              )}
              {page.intro && (
                <Box textStyle="larger" mb="3em" fontWeight="bold">
                  <MultiLangHtml json={page.intro} />
                </Box>
              )}

              <MultiLangHtml json={page.content} />
            </Box>
          </Box>
        </Box>
        <Box><Footer /></Box>
      </Grid>
    </MainContent>
  );
};

export const ModulePageGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

export const ModulePageGetStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const accessToken = (context?.previewData as any)?.accessToken;

  const { data } = await client.query({
    query: pageQuery,
    variables: {
      slug: context?.params?.slug,
    },
    ...(context?.preview && accessToken
      ? {
          context: {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {}),
  });

  if (!data?.page)
    return {
      props: {},
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      page: data?.page,
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 3600,
  };
};
