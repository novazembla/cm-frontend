import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import { ModuleComponentSuggestEvent } from "~/components/modules/suggest-event";
import { useRouter } from "next/router";
import { settingsQuery } from "~/graphql";
import { getApolloClient } from "~/services";

const SuggestLocation = ({ page }: { page: any }) => {
  const router = useRouter()
  return <ModuleComponentSuggestEvent key={`kpv-${router.asPath}`}  />;
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

SuggestLocation.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default SuggestLocation;
