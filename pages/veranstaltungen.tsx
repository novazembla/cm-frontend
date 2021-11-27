import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import LayoutFull from "~/components/app/LayoutFull";
import {
  ModuleComponentEvents,
} from "~/components/modules/events";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

const Veranstaltungen = ({ ...props }) => {
  return <ModuleComponentEvents {...props} />;
};

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
      frontendSettings: data?.frontendSettings,
    },
    revalidate: 300,
  };
}
Veranstaltungen.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Veranstaltungen;
