import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import { ModuleComponentSuggest } from "~/components/modules/suggest";

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
SuggestLocation.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default SuggestLocation;
