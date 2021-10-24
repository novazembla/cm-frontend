import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import {
  ModuleComponentEvents,
} from "~/components/modules";

const Veranstaltungen = ({ ...props }) => {
  return <ModuleComponentEvents {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
}

export default Veranstaltungen;
