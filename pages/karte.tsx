import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import { ModuleComponentMap } from "~/components/modules";

const Map = () => {
  return <ModuleComponentMap />;
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};

export default Map;
