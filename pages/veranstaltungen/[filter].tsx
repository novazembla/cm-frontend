import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentEvents,
} from "~/components/modules/events";
import { GetStaticProps, GetStaticPaths } from "next";
import LayoutFull from "~/components/app/LayoutFull";
import { getApolloClient } from "~/services";
import { settingsQuery } from "~/graphql";

const Events = ({ ...props }) => {
  return <ModuleComponentEvents {...props} />;
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
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Events;
