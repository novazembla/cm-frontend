import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import { ModuleComponentSuggest } from "~/components/modules";

export const SuggestLocation = () => {
  return <ModuleComponentSuggest />;
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};

export default SuggestLocation;
