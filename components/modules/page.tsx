import { useEffect } from "react";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
import { getApolloClient } from "~/services";
import { Box, Text, chakra, Grid } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useMapContext } from "~/provider";
import { useRouter } from "next/router";

const pageQuery = gql`
  query ($slug: String!) {
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

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [router.asPath, cultureMap]);

  return (
    <MainContent isDrawer layerStyle="pageBg">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box layerStyle="page">
          <Box layerStyle="headingPullOut" mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              <MultiLangValue json={page.title} />
            </chakra.h1>
          </Box>

          <Box color="cm.text" w="100%">
            {page.heroImage && page.heroImage.id && (
              <Box w="100%" mt="1em" mb="3em" position="relative">
                <Box bg="#333">
                  <ApiImage
                    id={page.heroImage.id}
                    alt={page.heroImage.alt}
                    meta={page.heroImage.meta}
                    forceAspectRatioPB={75}
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
        <Footer />
      </Grid>
    </MainContent>
  );
};

export const ModulePageGetStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

// This gets called on every request
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
    },
    revalidate: 3600,
  };
};
