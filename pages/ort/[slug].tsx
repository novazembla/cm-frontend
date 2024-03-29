import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  ModuleLocationGetStaticProps,
  ModuleLocationGetStaticPaths,
  ModuleComponentLocation,
} from "~/components/modules/location";
import { useRouter } from "next/router";
import LayoutFull from "~/components/app/LayoutFull";

const Location = ({ location, ...props }: { location: any; props: any }) => {
  const router = useRouter();
  return <ModuleComponentLocation key={`kp-${router.asPath}`}  location={location} {...props} />;
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleLocationGetStaticPaths(context);
};


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
