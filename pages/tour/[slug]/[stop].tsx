import { ReactElement } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleTourStopGetStaticProps,
  ModuleComponentTourStop,
} from "~/components/modules/tourStop";
import { ModuleTourGetStaticPaths } from "~/components/modules/tour";
import { ModuleComponentTourIntroduction } from "~/components/modules/tourIntroduction";
import { useRouter } from "next/router";
import LayoutFull from "~/components/app/LayoutFull";

const Tour = ({
  tour,
  tourStop,
  ...props
}: {
  tour: any;
  tourStop: any;
  props: any;
}) => {
  const router = useRouter();
  const stop = parseInt(
    router?.query?.stop
      ? Array.isArray(router?.query?.stop)
        ? router?.query?.stop[0]
        : router?.query?.stop
      : "-1"
  );

  return (
    <>
      {stop > 0 ? (
        <ModuleComponentTourStop tourStop={tourStop} tour={tour} {...props} />
      ) : (
        <ModuleComponentTourIntroduction tour={tour} {...props} />
      )}
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleTourGetStaticPaths(context);
};


export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModuleTourStopGetStaticProps(context);

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
