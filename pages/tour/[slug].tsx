import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleTourGetStaticProps,
  ModuleTourGetStaticPaths,
  ModuleComponentTour,
} from "~/components/modules";

const Tour = ({ location, ...props }: { location: any; props: any }) => {
  return <ModuleComponentTour tour={location} {...props} />;
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleTourGetStaticPaths(context);
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModuleTourGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};

export default Tour;
