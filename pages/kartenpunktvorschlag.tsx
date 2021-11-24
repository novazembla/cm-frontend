import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import { ModuleComponentSuggest } from "~/components/modules";
import { useRouter } from "next/router";

const SuggestLocation = ({ page }: { page: any }) => {
  const router = useRouter()
  return <ModuleComponentSuggest key={`kpv-${router.asPath}`}  />;
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
