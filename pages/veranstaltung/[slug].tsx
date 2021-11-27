import { ReactElement } from "react";

import { GetStaticPaths, GetStaticProps } from "next";

import LayoutFull from "~/components/app/LayoutFull";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleEventGetStaticProps,
  ModuleEventGetStaticPaths,
  ModuleComponentEvent,
} from "~/components/modules/event";

const Event = ({
  event,
  ...props
}: {
  event: any;
  props: any;
}) => {
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
Event.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Event;
