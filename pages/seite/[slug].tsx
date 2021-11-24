import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import {
  ModuleComponentPage,
  ModulePageGetStaticPaths,
  ModulePageGetStaticProps,
} from "~/components/modules/page";

const Page = ({ page, ...props }: { page: any; props: any }) => {
  return <ModuleComponentPage page={page} {...props} />;
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModulePageGetStaticPaths(context);
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModulePageGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};
Page.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Page;
