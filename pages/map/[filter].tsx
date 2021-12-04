import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentLocations,
} from "~/components/modules/locations";
import { GetStaticProps, GetStaticPaths } from "next";
import LayoutFull from "~/components/app/LayoutFull";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

const Locations = ({ ...props }) => {
  return <ModuleComponentLocations type="listing" {...props} />;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;
  const client = getApolloClient();
  
  const { data } = await client.query({
    query: settingsQuery,
  });

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      filter: context?.params?.filter ?? "",
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 300,
  };
}
Locations.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Locations;
