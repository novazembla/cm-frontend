import { useTranslation } from "next-i18next";
import { GetStaticPaths, GetStaticProps } from "next";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleEventGetStaticProps,
  ModuleEventGetStaticPaths,
  ModuleComponentEvent,
} from "~/components/modules";

const Event = ({
  event,
  ...props
}: {
  event: any;
  props: any;
}) => {
  const { t } = useTranslation();

  return (
    <ModuleComponentEvent
      event={event}
      {...props}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  return ModuleEventGetStaticPaths(context);
};

// This gets called on every request
export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModuleEventGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};

export default Event;
