import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { gql } from "@apollo/client";
import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { getApolloClient } from "~/services";
import { Box, Heading } from "@chakra-ui/react";

const Page = ({page}: {page:any}) => {
  return <Box layerStyle="pageContainerWhite">
  <Heading as="h1" mb="3"><MultiLangValue json={page.title} /></Heading>
  <Box maxW="800px"><MultiLangHtml json={page.content} /></Box>
</Box>
    
}

// This gets called on every request
export async function getServerSideProps({ params, locale }: { params: any, locale: any }) {
  const client = getApolloClient();
  
  const pageQuery = gql`
  query($slug: String!) {
    page(slug: $slug) {
      id
      title
      slug
      content
    }
  }`;

  const { data } = await client.query({
    query: pageQuery,
    variables: {
      slug: params.slug
    }
  });

  return {
    props: {
      ...(await serverSideTranslations(locale)),
      page: data.page,
    },
  }
};

export default Page;