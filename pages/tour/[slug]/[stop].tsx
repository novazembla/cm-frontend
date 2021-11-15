import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleTourStopGetStaticProps,
  ModuleTourGetStaticPaths,
  ModuleComponentTourStop,
  ModuleComponentTourIntroduction,
} from "~/components/modules";
import { useRouter } from "next/router";
import { TourContextProvider } from "~/provider";

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
    <TourContextProvider>
      {stop > 0 ? (
        <ModuleComponentTourStop tourStop={tourStop} tour={tour} {...props} />
      ) : (
        <ModuleComponentTourIntroduction tour={tour} {...props} />
      )}
    </TourContextProvider>
  );
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

  const out: any = await ModuleTourStopGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};

export default Tour;
