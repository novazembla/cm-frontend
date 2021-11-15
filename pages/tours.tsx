import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ModuleComponentTours,
  ModuleToursGetStaticProps
} from "~/components/modules";
import { GetStaticProps, GetStaticPaths } from "next";

const Tours = ({
  tours,
  totalCount,
  ...props
}: {
  tours: any;
  totalCount: number;
  props: any;
}) => {
  return <ModuleComponentTours tours={tours} totalCount={totalCount} {...props} />;
};

// This gets called on every request
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

export default Tours;
