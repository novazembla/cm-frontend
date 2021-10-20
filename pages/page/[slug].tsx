import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, Heading, Text } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";

const Page = ({ page }: { page: any }) => {
  if (page.heroImage) {
  }
  console.log(page);

  return (
    <Box layerStyle="pageContainerWhite">
      <Heading as="h1" mb="3">
        <MultiLangValue json={page.title} />
      </Heading>
      <Box maxW="800px">
        {page.heroImage && page.heroImage.id && (
          <Box w="100%" mb="2">
            <ApiImage
              id={page.heroImage.id}
              alt={page.heroImage.alt}
              meta={page.heroImage.meta}
              forceAspectRatioPB={75}
              status={page.heroImage.status}
              sizes="(min-widht: 55rem) 800px, 100vw"
            />
            {page.heroImage.credits !== "" && (
              <Text fontSize="xs" mt="0.5" color="gray.400">
                <MultiLangValue json={page.heroImage.credits} />
              </Text>
            )}
          </Box>
        )}
        <Box fontSize="lg">
          <MultiLangHtml json={page.intro} />
        </Box>

        <MultiLangHtml json={page.content} />
      </Box>
    </Box>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

// This gets called on every request
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
