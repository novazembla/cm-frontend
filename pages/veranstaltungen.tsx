import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import LayoutFull from "~/components/app/LayoutFull";
import {
  ModuleComponentEvents,
} from "~/components/modules/events";

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
Veranstaltungen.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Veranstaltungen;
