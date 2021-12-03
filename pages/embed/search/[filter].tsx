import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ModuleComponentLocationsEmbed } from "~/components/modules/locationsEmbed";
import { GetStaticProps, GetStaticPaths } from "next";
import LayoutLight from "~/components/app/LayoutLight";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

const Locations = ({ filter }: { filter: string }) => {
  return <ModuleComponentLocationsEmbed filter={filter} />;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async (context) => {
  const client = getApolloClient();

  const { data } = await client.query({
    query: settingsQuery,
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
      filter: context?.params?.filter ?? "",
      frontendSettings: data?.frontendSettings,
      revalidate: 300,
    },
  };
};

Locations.getLayout = function getLayout(page: ReactElement) {
  return <LayoutLight>{page}</LayoutLight>;
};

export default Locations;
