import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentEvents,
} from "~/components/modules";
import { GetStaticProps } from "next";

const Events = ({ ...props }) => {
  return <ModuleComponentEvents {...props} />;
};

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "en")),
    },
  };
}

export default Events;
