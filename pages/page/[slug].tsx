import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, Heading, Text } from "@chakra-ui/react";

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
            {page.heroImage.credits !== "" && <Text fontSize="xs" mt="0.5" color="gray.400"><MultiLangValue json={page.heroImage.credits}/></Text>}
          </Box>
        )}
        <MultiLangHtml json={page.content} />
      </Box>
    </Box>
  );
};

// This gets called on every request
export async function getServerSideProps({
  params,
  locale,
}: {
  params: any;
  locale: any;
}) {
  const client = getApolloClient();

  const pageQuery = gql`
    query ($slug: String!) {
      page(slug: $slug) {
        id
        title
        slug
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

  const { data } = await client.query({
    query: pageQuery,
    variables: {
      slug: params.slug,
    },
  });

  return {
    props: {
      ...(await serverSideTranslations(locale)),
      page: data.page,
    },
  };
}

export default Page;
