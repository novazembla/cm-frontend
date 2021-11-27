import { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentTours,
  ModuleToursGetStaticProps,
} from "~/components/modules/tours";
import LayoutFull from "~/components/app/LayoutFull";
import { GetStaticProps } from "next";

const Tours = ({
  tours,
  totalCount,
  ...props
}: {
  tours: any;
  totalCount: number;
  props: any;
}) => {
  return (
    <ModuleComponentTours tours={tours} totalCount={totalCount} {...props} />
  );
};


export const getStaticProps: GetStaticProps = async (context) => {
  const {
    // params,
    locale,
  } = context;

  const out: any = await ModuleToursGetStaticProps(context);

  return {
    ...out,
    props: {
      ...(await serverSideTranslations(locale ?? "en")),
      ...out?.props,
    },
  };
};
Tours.getLayout = function getLayout(page: ReactElement) {
  return <LayoutFull>{page}</LayoutFull>;
};
export default Tours;
