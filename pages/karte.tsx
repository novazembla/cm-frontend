import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentLocations,
} from "~/components/modules";
import { GetStaticProps } from "next";
import LayoutFull from "~/components/app/LayoutFull";

const Locations = ({ ...props }) => {
  return <ModuleComponentLocations {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
}
Locations.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Locations;
