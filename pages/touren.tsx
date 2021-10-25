import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentTours,
} from "~/components/modules";
import { GetStaticProps } from "next";

const Tours = ({ ...props }) => {
  return <ModuleComponentTours {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
}

export default Tours;
