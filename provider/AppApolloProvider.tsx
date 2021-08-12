import React from "react";
import {ApolloProvider} from "@apollo/client";
import { getApolloClient } from "~/services";

export const AppApolloProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ApolloProvider client={getApolloClient()}>{children}</ApolloProvider>;
};

export default AppApolloProvider;
