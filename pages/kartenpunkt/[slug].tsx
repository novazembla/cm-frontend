import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleLocationGetStaticProps,
  ModuleLocationGetStaticPaths,
  ModuleComponentLocation,
} from "~/components/modules";

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

export default Location;
