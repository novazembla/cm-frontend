import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, Heading, Text } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { Footer } from "~/components/app";

const Page = ({ page }: { page: any; }) => {
  return (
    <>
      <Box layerStyle="page">
        <Box layerStyle="headingPullOut" mb="3">
          <Heading as="h1" className="highlight" color="cm.text">
            <MultiLangValue json={page.title} />
          </Heading>
        </Box>

        <Box color="cm.text">
          {page.heroImage && page.heroImage.id && (
            <Box w="100%" mt="1em" mb="3em" position="relative">
              <Box bg="#333">
                <ApiImage
                  id={page.heroImage.id}
                  alt={page.heroImage.alt}
                  meta={page.heroImage.meta}
                  forceAspectRatioPB={75}
                  status={page.heroImage.status}
                  sizes="(min-width: 55rem) 800px, 100vw"
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
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

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
        }
      }
    }
  `;

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
      notFound: true,
      revalidate: 240,
    };

  return {
    props: {
      ...(await serverSideTranslations((context as any)?.locale)),
      page: data?.page,
    },
    revalidate: 240,
  };
};

export default Page;
