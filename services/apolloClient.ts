
import {
  from,
  ApolloClient,
  InMemoryCache,
  HttpLink
} from "@apollo/client";

import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import type { AppConfig } from "~/types";

import { appConfig } from "~/config/";

let client: ApolloClient<any> | null = null;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    // TODO: remove?
    graphQLErrors.forEach((err) =>
      console.log(
        err,
        `[GQLError error]: ${err.message} ${err?.extensions?.code ?? ""}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const createApolloClient = (config: AppConfig) => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([
      new RetryLink({
        delay: {
          initial: 500,
          max: 20000,
          jitter: true,
        },
        attempts: {
          max: 3,
          retryIf: (error /* , _operation */) => {
            return (
              !!error &&
              ![400, 403, 404].includes(parseInt(error.statusCode, 10))
            );
          },
        },
      }),
      errorLink,
      new HttpLink({
        uri: config.apiGraphQLURL, // Server URL (must be absolute)
        credentials: "include", // Additional fetch() options like `credentials` or `headers`
      }),
    ]),
    // TODO: find generic ways to manage the chache ...
    // HOW TO ENSURE deletion/updates are reflected in the cache ...
    // how will the cache expire?
    cache: new InMemoryCache({
      // typePolicies: {
      //   Query: {
      //     fields: {
      //       allPosts: concatPagination(), // TODO: adjust to useful results ..., not working ... https://github.com/apollographql/apollo-client/issues/6679
      //     },
      //   },
      // },¸
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "ignore",
      },
      query: {
        // TODO: revist better caching at some point
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

export const initializeClient = (settings: AppConfig) => {
  const aClient = client ?? createApolloClient(settings);

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return aClient;
  // Create the Apollo Client once in the client
  if (!client) client = aClient;

  return aClient;
};

export const getApolloClient = () => initializeClient(appConfig)