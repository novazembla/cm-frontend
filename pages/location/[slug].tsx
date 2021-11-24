import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleLocationGetStaticProps,
  ModuleLocationGetStaticPaths,
  ModuleComponentLocation,
} from "~/components/modules";
import LayoutFull from "~/components/app/LayoutFull";

const Location = ({ location, ...props }: { location: any; props: any }) => {
  return <ModuleComponentLocation location={location} {...props} />;
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleLocationGetStaticPaths(context);
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModuleLocationGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};

Location.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Location;
