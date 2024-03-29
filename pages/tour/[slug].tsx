import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleTourGetStaticProps,
  ModuleTourGetStaticPaths,
  ModuleComponentTour,
} from "~/components/modules/tour";
import LayoutFull from "~/components/app/LayoutFull";

const Tour = ({ ...props }) => {
  return <ModuleComponentTour tour={props.tour} {...props} />;
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleTourGetStaticPaths(context);
};


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

Tour.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};

export default Tour;


