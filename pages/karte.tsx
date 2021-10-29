import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentLocations,
} from "~/components/modules";
import { GetStaticProps } from "next";

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

export default Locations;
