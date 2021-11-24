import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ModuleComponentLocationsEmbed } from "~/components/modules/locationsEmbed";
import { GetStaticProps } from "next";
import LayoutLight from "~/components/app/LayoutLight";

const Locations = () => {
  return <ModuleComponentLocationsEmbed />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
};

Locations.getLayout = function getLayout(page: ReactElement) {
  return <LayoutLight>{page}</LayoutLight>;
};

export default Locations;
